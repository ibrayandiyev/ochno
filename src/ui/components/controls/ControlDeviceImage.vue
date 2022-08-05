<template>
  <div v-if="image" class="text-center">
    <img :src="image" class="port-image">
  </div>
</template>


<script>
import { computed } from 'vue';

import portsStore from '../../../modules/ports/store';

export default {
  props: {
    portId: { type: String, required: true },
  },

  setup(props) {
    return {
      image: computed(() => portsStore.state.device?.[props.portId]?.image),
    };
  },
};
</script>


<style scoped lang="less">
.port-image {
  max-width: 100%;
  max-height: 20rem;
  object-fit: contain;
  margin: 0 auto var(--row-gap);
}
</style>
