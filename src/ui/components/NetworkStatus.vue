<template>
  <div v-if="!online" class="network-status font-upper-case font-big1 color-error">
    {{ !internet ? $t('Internet connection lost') : ($t('Reconnecting...')) }}
  </div>
</template>


<script>
import { ref, computed, onUnmounted } from 'vue';

import iotStore from '../../modules/iot/store';

const networkEvents = ['online', 'offline'];

export default {
  setup() {
    const internet = ref(navigator.onLine || false);

    const online = computed(() => internet.value && !iotStore.getters.disconnected.value);

    function updateStatus() {
      internet.value = navigator.onLine || false;
    }

    networkEvents.forEach((event) => window.addEventListener(event, updateStatus));

    onUnmounted(() => networkEvents.forEach((event) => window.removeEventListener(event, updateStatus)));

    return {
      internet,
      online,
    };
  },
};
</script>

<style scoped lang="less">
.network-status {
  position: fixed;
  bottom: var(--column-gap);
  left: var(--column-gap);
  padding: var(--row-gap);
  border: 1px solid;
  border-color: inherit;
  background-color: rgb(var(--color-gray-1));
  opacity: 0;
  pointer-events: none;
  z-index: calc(var(--z-side-menu) + 1); // To be above "everything".
  animation: fade-to-1 1s 3s alternate infinite;
}
</style>
