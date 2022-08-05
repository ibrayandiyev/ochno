import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import api from './api';
import { productUpdate, productPrefix } from './product';
import buildStore from '../utils/buildStore';
import { hubsOfAccounts } from '../utils/lookupModel';

const store = buildStore({
  api,
  normalization: new schema.Entity('hubs'),
  validation: yupObject({
    hwId: yupString().required().label('Hardware ID'),
  }),
});

store.state.firmwares = { fetching: false };
store.state.configs = {};
store.state.logs = {};

store.getters.filtered = computed(() => ({ accountIds = [] }) => {
  const { state } = store;

  if (!accountIds.length) {
    return Object.values(state.hubs);
  }

  return hubsOfAccounts(state.hubs, accountIds);
});

store.getters.title = computed(() => (id) => {
  const hub = store.state.hubs[id];
  return hub ? (hub.name || hub.hwId) : '';
});

store.getters.findByHwId = computed(() => (hwId) => Object.values(store.state.hubs).find((item) => item.hwId === hwId));

// Get a single hub by hardware id.
store.dispatch.getHwId = ({ hwId }) => store.dispatch.run(api.getHwId(hwId), { pending: 'fetching' });

store.dispatch.getLogs = async (id) => {
  const { hubs, logs } = store.state;
  const hwId = hubs[id]?.hwId;
  if (hwId) {
    try {
      logs[id] = await api.getHwIdLog(hwId) || {};
    } catch (error) {
      console.error('Error getting logs', error); // eslint-disable-line no-console
    }
  }

  return logs[id];
};

store.dispatch.getFirmware = async (id) => {
  const { hubs, firmwares } = store.state;
  const prefix = productPrefix(hubs[id]?.hwId);
  const updateCode = productUpdate[prefix];

  if (updateCode) {
    firmwares.fetching = true;
    try {
      const { versions } = await api.getFirmware(id) || {};
      firmwares[updateCode] = versions;
    } catch (error) {
      console.error('Error fetching versions', error); // eslint-disable-line no-console
    }
    firmwares.fetching = false;
  }

  return firmwares[updateCode];
};

store.dispatch.putConfig = async (id, config) => {
  const { hubs, configs } = store.state;

  if (hubs[id]) {
    configs[id] = await api.putConfig(id, config);
  }

  return configs[id];
};

store.dispatch.putFirmware = async (id, version) => {
  const { hubs } = store.state;

  if (hubs[id] && version) {
    try {
      const { otaId, status } = await api.putFirmware(id, version);
      if (status === 'CREATE_COMPLETE') {
        return `Created update: ${otaId}`;
      }
      if (status === 'CREATE_FAILED') {
        return `Error creating update: ${otaId}`;
      }
      return `Pending update: ${otaId}`;
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      throw new Error('Unable to create update');
    }
  }

  return 'Hub or version is missing';
};

store.dispatch.putReboot = async (id) => {
  await api.putReboot(id.value);
  // NOTE: Unfortunately there is no better reboot signal.
  await new Promise((resolve) => setTimeout(() => resolve(), 10000)); // eslint-disable-line no-promise-executor-return
};

export default store;
