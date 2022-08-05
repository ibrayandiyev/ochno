import _ from 'lodash';
import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject, string as yupString, number as yupNumber } from 'yup';

import api from './api';
import buildStore from '../utils/buildStore';

const store = buildStore({
  api,
  normalization: new schema.Entity('deviceTypes'),
  validation: yupObject({
    match: yupObject({
      vid: yupString().length(4).when(['pid', 'voltage'], {
        is: (pid, voltage) => (!pid && !voltage),
        then: (vidSchema) => vidSchema.required(),
      }).label('Vendor ID'),
      pid: yupString().length(4).label('Product ID'),
      voltage: yupNumber().label('Voltage'),
    }),
  }),
});

store.getters.title = computed(() => (id) => {
  const deviceType = store.state.deviceTypes[id];
  return `${deviceType?.resolve?.device?.manufacturer || ''} - ${deviceType?.resolve?.device?.product || ''}`;
});

store.dispatch.postImage = ({ id, data }) => store.dispatch.run(api.postImage(id, data));

store.dispatch.match = async (device) => {
  const { vid, pid, voltage } = device;
  if (!vid && !voltage) {
    console.warn('No vid or voltage in device lookup', device); // eslint-disable-line no-console
    return null;
  }

  // Check the cached values.
  let deviceType;

  if (vid && pid) {
    deviceType = Object.values(store.state.deviceTypes).find((dt) => dt.match.vid === vid && dt.match.pid === pid);
  } else if (voltage) {
    deviceType = Object.values(store.state.deviceTypes).find((dt) => !dt.match.vid && !dt.match.pid && dt.match.voltage === voltage);
  }

  if (deviceType) {
    return deviceType;
  }

  // There was no cached values, check server.
  const matching = _.pick(device, 'vid', 'pid', 'voltage'); // Using pick here because it excludes undefined values.
  return store.dispatch.run(api.match(matching), { pending: 'fetching' });
};

store.dispatch.expand = async (port) => {
  const device = _.get(port, 'device');
  if (device) {
    const dt = await store.dispatch.match(device);
    return dt?.resolve ? _.merge(port, dt.resolve) : port;
  }
  return port;
};

export default store;
