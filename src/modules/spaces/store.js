import i18next from 'i18next';
import { schema } from 'normalizr';
import pip from 'point-in-polygon';
import { computed } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import api from './api';
import edgesStore from '../edges/store';
import hubsStore from '../hubs/store';
import buildStore from '../utils/buildStore';
import { spacesOfAccounts } from '../utils/lookupModel';

const store = buildStore({
  api,
  normalization: new schema.Entity('spaces'),
  validation: yupObject({
    accountId: yupString().required().label('Account'),
    name: yupString().required().label('Name'),
  }),
});

store.getters.filtered = computed(() => ({ accountIds = [] }) => {
  const { state } = store;

  if (!accountIds.length) {
    return Object.values(state.spaces);
  }

  return spacesOfAccounts(state.spaces, accountIds);
});

store.getters.title = computed(() => (id) => {
  const space = store.state.spaces[id];
  return space ? space.name || i18next.t('Unnamed space') : i18next.t('Unavailable');
});

store.getters.findItemSpace = computed(() => ({ itemId }) => store.getters.find.value((space) => space.items.find(({ id }) => id === itemId)));

store.getters.filterItems = computed(() => ({ id, type, polygonIds } = {}) => {
  const space = store.state.spaces[id];
  if (!space) {
    return [];
  }

  let items = type ? space.items.filter((item) => item.type === type) : space.items;

  // If items should also be filtered by being inside polygons.
  if (polygonIds && polygonIds.length) {
    const polygons = space.items.filter((item) => polygonIds.indexOf(item.id) >= 0 && item?.points?.length);
    items = items.filter(({ point }) => polygons.find(({ points }) => point && points && pip(point, points)));
  }

  return items;
});

store.getters.spaceItem = computed(() => ({ id, itemId }) => {
  const space = store.state.spaces[id];
  if (!space) {
    return null;
  }

  return space.items.find((item) => item.id === itemId);
});

store.getters.spaceItemTitle = computed(() => ({ id, itemId }) => {
  const title = hubsStore.getters.title.value(itemId) || edgesStore.getters.title.value(itemId);
  if (title) {
    return title;
  }

  // It's probably a port.
  const item = store.getters.spaceItem.value({ id, itemId });
  return i18next.t(item?.type || 'Unknown item');
});

store.dispatch.postImage = ({ id, data }) => store.dispatch.run(api.postImage(id, data));
store.dispatch.postAttributeImage = ({ id, data, key }) => store.dispatch.run(api.postAttributeImage(id, data, key));

export default store;
