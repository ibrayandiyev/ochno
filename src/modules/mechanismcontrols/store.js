import i18next from 'i18next';
import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import api from './api';
import spacesStore from '../spaces/store';
import buildStore from '../utils/buildStore';
import { spacesOfAccounts, mechanismControlsOfSpaces } from '../utils/lookupModel';

const store = buildStore({
  api,
  normalization: new schema.Entity('mechanismControls'),
  validation: yupObject({
    spaceId: yupString().required().label('Space'),
  }),
});

store.getters.filtered = computed(() => ({ accountIds = [], spaceIds = [] }) => {
  const { state } = store;

  if (!accountIds.length && !spaceIds.length) {
    return Object.values(state.mechanismControls);
  }

  const allSpaceIds = spacesOfAccounts(spacesStore.state.spaces, accountIds).map((space) => space.id).concat(spaceIds);
  return mechanismControlsOfSpaces(state.mechanismControls, allSpaceIds);
});

store.getters.title = computed(() => (id) => {
  const mechanismControl = store.state.mechanismControls[id];
  return mechanismControl?.name || i18next.t('Unnamed mechanism control');
});

export default store;
