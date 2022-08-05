/*
 * This module doesn't hold the user data, that is in the users module. This module uses that store.
 * The reason behind this is to only have one place that the data is stored.
*/

import { Ability } from '@casl/ability';
import { reactive, computed } from 'vue';

import api from './api';
import canAbility from './canAbility';
import usersStore from '../users/store';

const state = reactive({
  fetching: false,
  initialized: false,
  isLoggedIn: false,
  id: null,
  ability: new Ability(), // Updated when logging in/out.
});

const getters = {
  user: computed(() => (usersStore.state.users[state.id] || {})),
  name: computed(() => getters.user.value?.profile?.fullName),

  /**
   * Check if the user can create a certain kind of item.
   * The first parameter is what type of item you want to check. Pass it as a property with the key you want to check.
   * Example: { space: true }
   */
  canCreate: computed(() => (type) => state.ability.can('create', type)),

  /**
   * Check if the user can update a certain item.
   * The first parameter is the item that you want to update. Pass it as a property with the key you want to check.
   * The second parameter is collections that are required to be able to check permission, basically the parents of the item you want to check, all the way up to accountId.
   * Example: { hub: { spaceId: 'xxx', ... }, { spaces: [...] } }
   */
  canUpdate: computed(() => (type, item) => canAbility(state.ability, 'update', type, item)),

  /**
   * Check if the user can delete a certain item.
   * The first parameter is the item that you want to update. Pass it as a property with the key you want to check.
   * The second parameter is collections that are required to be able to check permission, basically the parents of the item you want to check, all the way up to accountId.
   * Example: { hub: { spaceId: 'xxx', ... }, { spaces: [...] } }
   */
  canDelete: computed(() => (type, item) => canAbility(state.ability, 'delete', type, item)),
};

function clear() {
  state.initialized = true;
  state.isLoggedIn = false;
  state.id = null;
  state.ability.update([]);
}

async function run(promise, catcher = clear) {
  state.fetching = true;
  state.initialized = false;
  try {
    const user = await promise;
    state.fetching = false;
    state.initialized = true;
    state.isLoggedIn = true;
    state.id = user.id;
    state.ability.update(user.abilities || []);
    usersStore.dispatch.assign(user); // The actual user data is in the users store, updating it.
    return user;
  } catch (error) {
    state.fetching = false;
    catcher(error);
    throw error;
  }
}

const dispatch = {
  init: () => run(api.userdata(), (error) => { throw error; }),
  login: (credentials) => run(api.login(credentials)),
  logout: () => clear() || api.logout(),
  forgot: async ({ email, route }) => api.forgot(email, route),
  getReset: async ({ token }) => api.getReset(token),
  reset: ({ token, password }) => run(api.reset(token, password)),
  setJWT: ({ token }) => api.setHeaders(token),
};

export default {
  name: 'auth',
  state,
  getters,
  dispatch,
};
