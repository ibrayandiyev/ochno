// import { ElMessageBox } from 'element-plus';
// import i18next from 'i18next';
import httpStatus from 'http-status';
import _ from 'lodash';
import { reactive, computed } from 'vue';

import api from './api';
import edgesStore from '../store';
import spacesStore from '../../spaces/store';

const statuses = {
  configuring: 'configuring',
  forbidden: 'forbidden',
  unauthorized: 'unauthorized',
};


const initial = {
  // For some properties the null value has special meaning. That we have fetched it, but not gotten anything in reply.
  device: undefined,
  gg: undefined,
  network: undefined,

  edge: undefined, // false has a special meaning, that getting the edge threw an unknown error.

  status: '',
  settingWifi: false,
};

const state = reactive({ ...initial });


function decode(string) {
  if (!string || !string.length) {
    return '';
  }

  // NOTE: I haven't figured out how to replace only the \x part of a string, it complains about not being a valid hexadecimal.
  const arr = Array.from(string);
  arr.forEach((val, i) => val === '\\' && arr[i + 1] === 'x' && arr.splice(i, 2, '%'));
  return decodeURIComponent(arr.join(''));
}

const getters = {
  serial: computed(() => state.device?.serial),
  ssid: computed(() => state.network?.connection?.ssid),
  ssids: computed(() => _.chain(state.network?.wifis || [])
    .map('ssid')
    .compact()
    .uniq()
    .map((value) => decode(value)) // In case names have weird characters.
    .value()),

  isConfiguring: computed(() => state.status === statuses.configuring),
  needsSetup: computed(() => (state.device && !state.device.activated) || !state.edge?.accountId || state.gg === null),
  needsReset: computed(() => state.edge && state.status === statuses.unauthorized),
  needsTransition: computed(() => state.status === statuses.forbidden),

  hasContact: computed(() => !!state.device),
  hasWifi: computed(() => !!state.network?.connection?.ssid),
  hasInternet: computed(() => state.network?.online),
};


const get = {};
const set = {};
const pollers = {
  device: null,
  network: null,
  edge: null,
};

get.edge = async () => {
  const hwId = getters.serial.value;
  if (hwId) {
    try {
      const edge = await edgesStore.dispatch.getHwId({ hwId });
      set.edge(edge);
    } catch (error) {
      set.edge(null);
      if (error?.response?.status === httpStatus.FORBIDDEN) {
        state.status = statuses.forbidden;
      } else if (error?.response?.status !== httpStatus.BAD_REQUEST) {
        set.edge(false);
        clearTimeout(pollers.edge);
        pollers.edge = setTimeout(get.edge, 2000);
      }
    }
  }
};

// Caller should catch possible errors.
set.edge = async (edge) => {
  state.edge = edge;

  if (state.device && state.device.activated && edge) {
    await get.login();
    get.all();
  }
};

get.device = async () => {
  try {
    const device = await api.edge.get();
    set.device(device);
  } catch (error) {
    set.device(null);
  }
  clearTimeout(pollers.device);
  pollers.device = setTimeout(get.device, state.device ? 10000 : 2000);
};

set.device = async (device) => {
  const newDevice = device ? { ...state.device, ...device } : device;
  const newSerial = newDevice && (!state.device || newDevice.serial !== state.device.serial);
  if (!_.isEqual(newDevice, state.device)) {
    state.device = newDevice;

    if (newSerial) {
      get.edge();
    }
  }
};

get.login = async () => {
  try {
    await api.auth.login(state.edge);
  } catch (error) {
    state.status = statuses.unauthorized;
  }
};

get.info = async () => {
  try {
    const device = await api.edge.info();
    set.device(device);
  } catch (error) {
    // Do nothing.
  }
};

get.gg = async () => {
  if (state.edge) {
    try {
      const gg = await api.gg.get();
      state.gg = gg;
    } catch (error) {
      state.gg = null;
    }
  }
};

get.network = async () => {
  clearTimeout(pollers.network);

  if (!state.device) {
    return;
  }

  try {
    const network = await api.network.get();
    state.network = network;
  } catch (error) {
    state.network = null;
  }

  if (!state.network) {
    pollers.network = setTimeout(get.network, 2000);
  }
};

get.all = async () => state.status !== statuses.unauthorized && Promise.all([
  get.info(),
  get.gg(),
  get.network(),
]);


const dispatch = {
  clear() {
    Object.values(pollers).forEach((poll) => clearTimeout(poll));
    Object.assign(state, { ...initial });
  },

  init() {
    dispatch.clear();
    get.device();
  },

  // The action caller should set up a catch method in case of error.
  async setupEdge({ spaceId } = {}) {
    state.status = statuses.configuring;

    const space = spaceId && spacesStore.state.spaces[spaceId];
    if (!space) {
      return Promise.reject(new Error('Unable to setup edge without space'));
    }

    const { accountId } = space;

    try {
      if (!state.edge) {
        await edgesStore.dispatch.post({ hwId: getters.serial.value, accountId });
      } else if (!state.edge.accountId) {
        await edgesStore.dispatch.put({ id: state.edge.id, data: { ...state.edge, accountId } });
      }

      const spaceEdge = state.edge && spacesStore.getters.spaceItem.value({ id: spaceId, itemId: state.edge.id });
      if (!spaceEdge) {
        // Clone space, if the put fails, the edge should not be in the map.
        const spaceClone = _.cloneDeep(space);
        spaceClone.items.push({ type: 'edge', id: state.edge.id, point: [0, 0] });
        await spacesStore.dispatch.put({ id: spaceId, data: spaceClone });
      }

      const deployed = await edgesStore.dispatch.putDeploy({ id: state.edge.id, configure: true });
      const { username, password, configuration, files } = deployed.core;
      state.edge = deployed.edge;

      await api.auth.setup({ username, password });
      await get.login();
      await api.gg.post({ configuration, files });
      await get.all();
      state.status = '';
    } catch (error) {
      state.status = '';
      throw error;
    }

    return true;
  },

  // This function resets the Edge account owner only, it does not reset the device.
  // The action caller should set up a catch method in case of error.
  async removeEdge(edge) {
    return edgesStore.dispatch.put({ id: edge.id, data: { ...edge, accountId: null } });
  },

  // This function both removes the Edge from Operated and resets the device.
  // The action caller should set up a catch method in case of error.
  async resetEdge() {
    state.status = statuses.configuring;

    if (state.edge) {
      await Promise.all([
        dispatch.removeEdge(state.edge),
        api.edge.reset(),
      ]);
    }
    dispatch.init();
  },

  requestTransfer() {
    // Not implemented yet.
  },

  async setWifi({ ssid, password }) {
    state.settingWifi = true;
    let err;

    try {
      await api.network.post({ ssid, password });
    } catch (error) {
      err = error;
    }

    state.settingWifi = false;
    get.network();

    if (err) {
      throw err;
    }
  },

  // The action caller should set up a catch method in case of error.
  async updateEdge(data) {
    if (state.edge) {
      const edge = await edgesStore.dispatch.put({ id: state.edge.id, data: { ...state.edge, ...data } });
      await set.edge(edge);
    }
  },
};

export default { state, getters, dispatch };
