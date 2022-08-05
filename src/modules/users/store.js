import _ from 'lodash';
import { schema } from 'normalizr';
import { computed } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import api from './api';
import buildStore from '../utils/buildStore';

const store = buildStore({
  api,
  normalization: new schema.Entity('users'),
  validation: yupObject({
    email: yupString().required().email().label('Email'),
    password: yupString().required().min(8).label('Password'),
  }),
});

store.getters.filtered = computed(() => ({ accountIds = [] }) => {
  const { state } = store;

  if (!accountIds.length) {
    return Object.values(state.users);
  }

  // TODO: TAG: RESTRUCTURE
  return Object.values(state.users).filter((user) => _.intersection(_.flatten(_.values(user.roles)), accountIds).length);
});

store.getters.title = computed(() => (id) => {
  const user = store.state.users[id];
  return user ? (user.profile?.fullName || user.email) : '';
});

store.dispatch.postPicture = ({ id, data }) => store.dispatch.run(api.postPicture(id, data));

export default store;
