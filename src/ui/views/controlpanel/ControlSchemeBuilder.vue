<template>
  <div v-visibility="visibilityChanged" v-page-visibility="visibilityChanged" class="control-scheme-builder">
    <div v-for="(wrap, i) in wrappers" :key="i" class="control-wrapper" :class="{ grid: wrap.length > 1 }">
      <component
        :is="ctrl.component"
        v-for="(ctrl, j) in wrap"
        :key="j"
        v-bind="ctrl.parameters"
        :space-id="spaceId"
        :mechanism-ids="mechanismIds"
        :port-ids="portTypesMap[ctrl.deviceType]"
        :class="ctrl.class || ''"
        :style="ctrl.style || ''"
      />
    </div>
  </div>
</template>


<script>
// TODO: The style above feels quite "hacky", can this be solved another way?

import _ from 'lodash';
import { ref, computed, watchEffect } from 'vue';

import CustomHTML from './CustomHTML.vue';
import CustomImage from './CustomImage.vue';
import useIotStream from '../../composables/useIotStream';
import { componentMap, deviceMap } from '../../templates/ports/controls/deviceMap';
import controlSchemesStore from '../../../modules/controlschemes/store';
import portsStore from '../../../modules/ports/store';

const components = { CustomImage, CustomHTML, ...componentMap };

const defaultScheme = {
  controls: Object.entries(deviceMap)
    .filter(([deviceType]) => deviceType !== 'dimmer') // Do not include the dimmer type, the controls for that one rely on rules being imported and it feels a bit over the top to have in this ui.
    .map(([deviceType, value]) => ({ ...value, deviceType })),
};

export default {
  components,

  props: {
    controlSchemeId: { type: String },
    spaceId: { type: String },
    mechanismIds: { type: Array, default: () => [] },
    portIds: { type: Array, default: () => [] },
    controls: { type: Array },
  },

  setup(props) {
    const streamingPortIds = ref(null);

    useIotStream({ ports: streamingPortIds });

    function getComponent({ component, deviceType }) {
      if (component) {
        return typeof component === 'string' ? components[component] : component;
      }
      return _.get(deviceMap, `${deviceType}.component`);
    }

    const controlScheme = computed(() => controlSchemesStore.state.controlSchemes[props.controlSchemeId]);
    const portTypesMap = computed(() => portsStore.getters.mapTypes.value(props.portIds));

    const layout = computed(() => {
      if (props.controlSchemeId) {
        return controlScheme.value || {};
      }
      if (props.controls) {
        return { controls: props.controls };
      }
      return defaultScheme;
    });

    const wrappers = computed(() => {
      const wrappings = [];
      let current;
      let prevVertical;
      for (let i = 0; i < layout.value.controls.length; i++) {
        const control = layout.value.controls[i] || {};
        const component = getComponent(control);
        const { deviceType, parameters } = control;
        if (component && (!deviceType || portTypesMap.value[deviceType])) {
          const parsedComponent = { ...control, component };
          const vertical = _.get(parameters, 'customize.controls.vertical');
          if (vertical && prevVertical) {
            current.push(parsedComponent);
          } else {
            current = [parsedComponent];
            wrappings.push(current);
          }
          prevVertical = vertical;
        }
      }

      return wrappings;
    });

    const streamPorts = computed(() => layout.value.controls
      .map(({ deviceType }) => deviceType)
      .map((deviceType) => portTypesMap.value[deviceType])
      .filter((value) => value)
      .flat());

    watchEffect(() => {
      streamingPortIds.value = streamPorts.value;
    });

    return {
      portTypesMap,
      wrappers,

      visibilityChanged(isVisible) {
        if (isVisible) {
          streamingPortIds.value = streamPorts.value;
        } else {
          streamingPortIds.value = null;
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.control-wrapper {
  position: relative;
  padding: 0 10% calc(var(--common-size) / 2);
  border-bottom: solid 0.5rem rgb(var(--color-black));

  // When the wrapper has multiple items in it.
  grid-template-columns: repeat(auto-fit, minmax(calc(var(--common-size) * 2), max-content));
  justify-content: center;
  column-gap: var(--row-gap);
}
</style>
