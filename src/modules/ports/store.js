import i18next from 'i18next';
import _ from 'lodash';
import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject } from 'yup';

import api from './api';
import deviceTypesStore from '../devicetypes/store';
import hubsStore from '../hubs/store';
import buildStore from '../utils/buildStore';
import { hubsOfAccounts, portsOfHubs } from '../utils/lookupModel';
import lookup from '../../ui/components/icons/lookup';
import { BUTTON, DEVICE, FAN, LAMP, POWER, SENSOR } from './info';
import { CONNECTED, ENABLED } from './info/data';

const fiveMinInMs = 5 * 60 * 1000;

// Keep track of the last time a port was updated.
function setTime(state, id, time) {
  const cur = state.latest[id];
  const max = _.max([cur, time]);
  if (max !== cur) {
    state.latest[id] = max; // eslint-disable-line no-param-reassign
  }

  const online = max > (Date.now() - fiveMinInMs);
  const info = state.info[id];
  if (info && online !== info.online) {
    info.online = online;
  }
}

function extractTime(state, id, data) {
  if (id && data?.t) {
    setTime(state, id, data.t);
    delete data.t; // eslint-disable-line no-param-reassign
  }
}

const schemaOptions = { idAttribute: (value, parent) => parent.id };

const store = buildStore({
  api,
  normalization: new schema.Entity('ports', {
    data: new schema.Entity('data', {
      [BUTTON]: new schema.Entity(BUTTON, undefined, schemaOptions),
      [DEVICE]: new schema.Entity(DEVICE, undefined, schemaOptions),
      [FAN]: new schema.Entity(FAN, undefined, schemaOptions),
      [LAMP]: new schema.Entity(LAMP, undefined, schemaOptions),
      [POWER]: new schema.Entity(POWER, undefined, schemaOptions),
      [SENSOR]: new schema.Entity(SENSOR, undefined, schemaOptions),
    }, {
      idAttribute: (value, parent) => parent.id,
      processStrategy: (value, parent) => ({ ...value, id: parent.id }),
    }),
  }),
  validation: yupObject({

  }),
  postProcess({ entities }) {
    if (!entities) {
      return;
    }

    const onlineLimit = Date.now() - fiveMinInMs;
    let changes = [];

    if (entities.ports) {
      Object.keys(entities.ports).forEach((id) => !store.state.info[id] && changes.push(id));
    }

    if (entities.data) {
      Object.entries(entities.data).forEach(([id, data]) => {
        extractTime(store.state, id, data);

        if (Object.prototype.hasOwnProperty.call(data, CONNECTED) || Object.prototype.hasOwnProperty.call(data, ENABLED)) {
          changes.push(id);
        }
      });
    }

    if (entities[DEVICE]) {
      changes = changes.concat(Object.keys(entities[DEVICE]));
    }

    _.uniq(changes).forEach((id) => {
      const { connected, enabled, nonexistent } = _.get(store.state, `data.${id}`) || {}; // May have null value, so do not use getter default.
      const { manufacturer, product, types, subtypes } = _.get(store.state, `${DEVICE}.${id}`) || {}; // May have null value, so do not use getter default.
      const latest = store.state.latest[id];
      const isConnected = connected !== false;
      const isEnabled = enabled !== false;
      const online = latest && latest > onlineLimit;

      // NOTE: Need to do a hard check for false, since enabled = undefined is considered enabled.
      const portTypes = ((!isConnected || !isEnabled) && ['port'])
        || ((!types || !types.length) && ['connected'])
        || types
        || [];

      const portSubtypes = ((!isConnected || !isEnabled) && [])
        || subtypes
        || [];

      store.state.info[id] = {
        online,
        nonexistent: !online && !!nonexistent,

        types: portTypes,
        subtypes: portSubtypes,

        icon: portSubtypes.find((type) => lookup[type])
          || portTypes.find((type) => lookup[type])
          || 'port',

        name: (!online && nonexistent && i18next.t('Port not found'))
          || (!isEnabled && i18next.t('Disabled port'))
          || (!isConnected && i18next.t('Empty port'))
          || `${manufacturer || ''} ${product || ''}`.trim()
          || portSubtypes.find((subtype) => i18next.exists(subtype) && i18next.t(subtype))
          || portTypes.find((type) => i18next.exists(type) && i18next.t(type))
          || i18next.t('Generic device'),
      };
    });
  },
});

// Add info and latest time stamp to default state.
store.state.info = {};
store.state.latest = {};

store.getters.types = computed(() => (portIds = [], key = 'types') => _.chain(portIds)
  .castArray()
  .map((portId) => _.get(store.state.info, `${portId}.${key}`, []))
  .flatten()
  .uniq()
  .value());

store.getters.mapTypes = computed(() => (portIds = [], key = 'types') => {
  const devices = {};
  portIds.forEach((portId) => {
    const types = _.get(store.state.info, `${portId}.${key}`, []);
    types.forEach((type) => {
      if (devices[type]) {
        devices[type].push(portId);
      } else {
        devices[type] = [portId];
      }
    });
  });
  return devices;
});

store.getters.filtered = computed(() => ({ accountIds = [], hubIds = [] }) => {
  const { state } = store;

  if (!accountIds.length && !hubIds.length) {
    return Object.values(state.ports);
  }

  const allHubIds = hubsOfAccounts(hubsStore.state.hubs, accountIds).map((hub) => hub.id).concat(hubIds);
  return portsOfHubs(state.ports, allHubIds);
});

store.getters.title = computed(() => (id) => {
  const port = store.state.ports[id];
  const info = store.state.info[id];
  return port?.name || info?.name || '';
});

store.getters.filterByType = computed(() => ({ portIds, type }) => portIds.filter((id) => _.get(store.state.info, `${id}.types`, []).indexOf(type) >= 0));

// Special action for putting a mqtt message.
store.dispatch.message = async ({ id, payload }) => {
  // Set timestamp to now, since we might have gotten old messages.
  payload.t = Date.now(); // eslint-disable-line no-param-reassign

  // If payload has a connected and it is set to false, make sure to null the device.
  if (payload.connected === false) {
    payload.device = null; // eslint-disable-line no-param-reassign
  }

  if (payload.device && !payload.device.types) {
    await deviceTypesStore.dispatch.expand(payload);
  }

  store.dispatch.assign({ id, data: payload });
};

export default store;


// Check online status once per minute.
setInterval(() => {
  const { state } = store;
  Object.keys(state.info).forEach((id) => setTime(state, id, state.latest[id]));
}, 60 * 1000);
