<template>
  <div>
    <router-view />
    <NetworkStatus />
  </div>
</template>


<script>
import _ from 'lodash';

import NetworkStatus from '../components/NetworkStatus.vue';
import viewPortFix from '../utils/viewPortFix';

export default {
  components: { NetworkStatus },

  setup() {
    // Fix the view port height so that the app looks fullscreen, not overflowing-screen, on mobile.
    viewPortFix();
    const throttledViewPortFix = _.throttle(viewPortFix, 200);
    window.addEventListener('resize', throttledViewPortFix);
    window.addEventListener('orientationchange', throttledViewPortFix);

    return {};
  },
};
</script>
