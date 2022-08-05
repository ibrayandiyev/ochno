<template>
  <transition name="fade" appear>
    <div class="centered background-polygons background-cover">
      <Spinner :text="$t('Signing out')" />
    </div>
  </transition>
</template>


<script>
/*
- WHY A LOGOUT COMPONENT IS NECESSARY:
When a user logs out we need to make sure that everything is cleaned up in stores and login information.
This is supposed to happen in this file, instead of having a mixin for logging out or anthing like that.
It makes it easy to create logout buttons by simply using a router view and this component takes care of the rest.

The way we "reset" the data store is simply be reloading the page.
It is by far the easiest implementation and isn't particularly ugly in this uncommon situation either.
*/
import { useRouter } from 'vue-router';

import Spinner from '../../components/Spinner.vue';
import authStore from '../../../modules/auth/store';

export default {
  components: { Spinner },

  setup() {
    const router = useRouter();

    (async () => {
      await authStore.dispatch.logout();
      await router.replace({ path: '/signin' });
      router.go(); // Refresh site.
    })();

    return {};
  },
};
</script>


<style scoped lang="less">
.centered {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
}
</style>
