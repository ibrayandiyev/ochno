import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import api from './api';
import buildStore from '../utils/buildStore';
import { edgesOfAccounts } from '../utils/lookupModel';

const store = buildStore({
  api,
  normalization: new schema.Entity('edges'),
  validation: yupObject({
    hwId: yupString().required().label('Hardware ID'),
  }),
});

store.getters.filtered = computed(() => ({ accountIds = [] }) => {
  const { state } = store;

  if (!accountIds.length) {
    return Object.values(state.edges);
  }

  return edgesOfAccounts(state.edges, accountIds);
});

store.getters.title = computed(() => (id) => {
  const edge = store.state.edges[id];
  return edge ? (edge.name || edge.hwId) : '';
});

// Get a single edge by hardware id.
store.dispatch.getHwId = ({ hwId }) => store.dispatch.run(api.getHwId(hwId), { pending: 'fetching' });
store.dispatch.putDeploy = ({ id, configure, force }) => store.dispatch.run(api.putDeploy(id, { configure, force }));

export default store;
