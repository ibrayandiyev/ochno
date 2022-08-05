import { abilitiesPlugin } from '@casl/vue';

import authStore from '../modules/auth/store';

export default (vueApp) => {
  // TODO: TAG: RESTRUCTURE Is this even necessary?
  vueApp.use(abilitiesPlugin, authStore.state.ability);
};
