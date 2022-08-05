<template>
  <div class="control-sliders">
    <ControlHeader :port-ids="portIds" :device-type="deviceType" :text="text" :customize="customize.header" />

    <ControlDeviceImage v-if="showDeviceImage" :port-id="portIds[0]" />

    <slot />

    <div v-for="{ label, settings } in groups" :key="label" class="group" :class="controlClasses">
      <h4 v-if="groups.length > 1" class="group-header">{{ label }}</h4>
      <ControlSlider
        v-for="setting in settings"
        :key="setting.prop"
        v-bind="setting"
        :port-ids="portIds"
        :device-type="deviceType"
        :vertical="$_.get(customize, 'controls.vertical')"
      />
    </div>
  </div>
</template>


<script>
import { computed } from 'vue';

import ControlDeviceImage from './ControlDeviceImage.vue';
import ControlHeader from './ControlHeader.vue';
import ControlSlider from './ControlSlider.vue';
import useDevice from '../../composables/useDevice';

export default {
  components: { ControlDeviceImage, ControlHeader, ControlSlider },

  props: {
    portIds: { type: Array, default: () => [] },
    deviceType: { type: String, required: true },
    paths: { type: Array },
    text: { type: String },
    customize: { type: Object, default: () => ({}) },
    // {
    //   header: {
    //     ... see ControlHeader.
    //   },
    //   device: {
    //     image: { type: Boolean },
    //   },
    //   controls: {
    //     icon: { type: Boolean },
    //     label: { type: Boolean },
    //     number: { type: Boolean },
    //     vertical: { type: Boolean },
    //   },
    // }
  },

  setup(props) {
    const { deviceTypeSettings } = useDevice();

    return {
      controlClasses: computed(() => ({
        'no-control-icon': props.customize?.controls?.icon === false,
        'no-control-label': props.customize?.controls?.label === false,
        'no-control-number': props.customize?.controls?.number === false,
        'grid vertical-grid': props.customize?.controls?.vertical,
      })),

      showDeviceImage: computed(() => props.customize?.device?.image && props.portIds.length === 1),

      groups: computed(() => deviceTypeSettings({ portIds: props.portIds, type: props.deviceType, paths: props.paths })),
    };
  },
};
</script>


<style scoped lang="less">
.group + .group {
  margin-top: var(--row-gap);
}

.group-header {
  margin-bottom: calc(var(--column-gap) * 1.5);
}
</style>
