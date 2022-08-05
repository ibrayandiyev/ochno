import i18next from 'i18next';
import _ from 'lodash';
import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import api from './api';
import spacesStore from '../spaces/store';
import buildStore from '../utils/buildStore';
import { spacesOfAccounts, mechanismsOfSpaces } from '../utils/lookupModel';

const store = buildStore({
  api,
  normalization: new schema.Entity('mechanisms'),
  validation: yupObject({
    spaceId: yupString().required().label('Space'),
  }),
});

store.state.puttingState = false;

store.getters.filtered = computed(() => ({ accountIds = [], spaceIds = [], portIds = [] }) => {
  const { state } = store;

  if (!accountIds.length && !spaceIds.length && !portIds.length) {
    return Object.values(state.mechanisms);
  }

  const allSpaceIds = spacesOfAccounts(spacesStore.state.spaces, accountIds).map((space) => space.id).concat(spaceIds);
  const mechanisms = mechanismsOfSpaces(state.mechanisms, allSpaceIds);

  if (portIds.length) {
    return mechanisms.filter(({ ports }) => _.intersection(ports, portIds).length);
  }

  return mechanisms;
});

store.getters.title = computed(() => (id) => {
  const mechanism = store.state.mechanisms[id];
  return mechanism?.name || i18next.t('Unnamed mechanism');
});

store.dispatch.putState = ({ id, state }) => store.dispatch.run(api.putState(id, state), { pending: 'puttingState' });

export default store;
