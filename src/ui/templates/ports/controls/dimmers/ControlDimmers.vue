<template>
  <div class="control-dimmers control-width">
    <ControlDimmer v-for="portId in portIds" :key="portId" :port-id="portId" />
  </div>
</template>

<script>
import ControlDimmer from './ControlDimmer.vue';

export default {
  components: { ControlDimmer },

  props: {
    portIds: { type: Array, default: () => [] },
  },
};
</script>

<style scoped lang="less">

</style>
