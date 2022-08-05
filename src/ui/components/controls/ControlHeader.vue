<template>
  <div class="control-header control-grid" :class="classes">
    <Icon v-bind="iconData" prefix="device" :default="deviceType" class="font-big2" />
    <h3 v-if="hasCount" class="label -circle">{{ count }}</h3>
    <div class="content">
      <h3 v-if="isSingle">{{ portName }}</h3>
      <slot v-else>
        <AlertBar>{{ text }}</AlertBar>
      </slot>
    </div>
  </div>
</template>


<script>
import { computed } from 'vue';

import AlertBar from '../AlertBar.vue';
import portsStore from '../../../modules/ports/store';

export default {
  components: { AlertBar },

  props: {
    portIds: { type: Array, default: () => [] },
    deviceType: { type: String, default: 'port' },
    text: { type: String, default: '' },
    customize: { type: Object, default: () => ({}) },
    // {
    //   icon: { type: Boolean },
    //   label: { type: Boolean },
    //   text: { type: Boolean },
    // },
  },

  setup(props) {
    const count = computed(() => props.portIds.length);
    const isSingle = computed(() => count.value === 1);
    const hasCount = computed(() => count.value > 1);

    return {
      count,
      isSingle,
      hasCount,
      iconData: computed(() => (isSingle.value ? { portId: props.portIds[0] } : { type: props.deviceType })),
      portName: computed(() => portsStore.state.info?.[props.portIds[0]]?.name),
      classes: computed(() => ({
        'no-control-icon': props.customize.icon === false,
        'no-control-label': !hasCount.value || props.customize.label === false,
        'no-control-content': props.customize.text === false,
      })),
    };
  },
};
</script>

<style scoped lang="less">
.control-header {
  min-height: calc(var(--common-size) * 2);
}

.no-control-content {
  &.control-header,
  .control-header {
    justify-content: center;
    min-height: auto;
    margin-top: calc(var(--common-size) * 0.7);
    margin-bottom: 1rem;
  }
}
</style>
