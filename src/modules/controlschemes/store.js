import i18next from 'i18next';
import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import api from './api';
import authStore from '../auth/store';
import buildStore from '../utils/buildStore';
import { controlSchemesOfAccounts } from '../utils/lookupModel';

const store = buildStore({
  api,
  normalization: new schema.Entity('controlSchemes'),
  validation: yupObject({
    accountId: yupString().required().label('Account'),
  }),
});

store.getters.filtered = computed(() => (filter) => {
  const { state } = store;
  const { accountIds = [] } = filter;

  if (!accountIds.length) {
    return Object.values(state.controlSchemes);
  }

  return controlSchemesOfAccounts(state.controlSchemes, accountIds);
});

store.getters.title = computed(() => (id) => {
  const controlScheme = store.state.controlSchemes[id];
  return controlScheme?.name || i18next.t('Unnamed control scheme');
});

store.dispatch.use = async ({ id }) => {
  const item = await store.dispatch.run(api.use(id), { pending: 'fetching' });
  authStore.dispatch.setJWT(item);
  return item;
};

store.dispatch.postImage = ({ data }) => api.postImage(data);

export default store;
