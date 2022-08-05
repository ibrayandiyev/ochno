<template>
  <div class="control-lamps control-width">
    <ControlMasterSlider
      :port-ids="portIds"
      device-type="lamp"
      :paths="paths"
      :text="`${$t('Master lamp controls')} (${$t('average')})`"
      :customize="customize"
    />
  </div>
</template>


<script>
import ControlMasterSlider from '../../../../components/controls/ControlMasterSlider.vue';

export default {
  components: { ControlMasterSlider },

  props: {
    portIds: { type: Array, default: () => [] },
    paths: { type: Array },
    customize: { type: Object, default: () => ({}) }, // See ControlMasterSlider
  },
};
</script>


<style scoped lang="less">
</style>
