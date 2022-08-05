import i18next from 'i18next';
import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import api from './api';
import buildStore from '../utils/buildStore';

const store = buildStore({
  api,
  normalization: new schema.Entity('accounts'),
  validation: yupObject({
    name: yupString().required().label('Name'),
  }),
});

store.getters.title = computed(() => (id) => {
  const account = store.state.accounts[id];
  return account?.name || i18next.t('Unnamed account');
});

store.dispatch.postImage = ({ id, data }) => store.dispatch.run(api.postImage(id, data));

store.dispatch.groups = {
  get: ({ id }) => store.dispatch.run(api.groups.get(id), { pending: 'fetching', update: false }),
  post: ({ id, data }) => store.dispatch.run(api.groups.post(id, data), { update: false }),
  getOne: ({ id, groupId }) => store.dispatch.run(api.groups.getOne(id, groupId), { update: false }),
  put: ({ id, groupId, data }) => store.dispatch.run(api.groups.put(id, groupId, data), { update: false }),
  delete: ({ id, groupId }) => store.dispatch.run(api.groups.delete(id, groupId), { update: false }),
};

export default store;
