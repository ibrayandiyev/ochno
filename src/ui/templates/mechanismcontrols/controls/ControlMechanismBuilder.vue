<template>
  <div class="control-mechanism-builder control-width">
    <div class="auto-fr-grid">
      <Icon :type="control.icon" default="deviceOchnoOperated" class="font-big2" />
      <h3>{{ control.name }}</h3>
    </div>

    <template v-for="(config, index) in control.controls">
      <div v-if="componentMap[config.type]" :key="index" class="control-mechanism-wrapper">
        <component :is="componentMap[config.type]" v-bind="config" :mechanism-ids="control.mechanismIds ? $_.intersection(mechanismIds, control.mechanismIds) : mechanismIds" />
      </div>
    </template>
  </div>
</template>


<script>
import { computed } from 'vue';

import ControlMechanismButtons from './ControlMechanismButtons.vue';
import mechanismControlsStore from '../../../../modules/mechanismcontrols/store';

const componentMap = {
  buttons: ControlMechanismButtons,
};

export default {
  components: { ControlMechanismButtons },

  props: {
    mechanismControlId: { type: String },
    mechanismIds: { type: Array, default: () => [] },
  },

  setup(props) {
    return {
      componentMap,

      control: computed(() => mechanismControlsStore.state.mechanismControls[props.mechanismControlId]),
    };
  },
};
</script>

<style scoped lang="less">
.auto-fr-grid {
  min-height: calc(var(--common-size) * 2);
}

.control-mechanism-wrapper + .control-mechanism-wrapper {
  margin-top: var(--row-gap);
}
</style>
