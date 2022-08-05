<template>
  <div class="control-dimmer">
    <ControlHeader :port-ids="[portId]" device-type="dimmer" :text="$t('Dimmer')" />

    <div v-if="!settings.length" class="text-center">
      {{ $t('Dimmer is not controling anything. Connect the dimmer to a rule to set it up.') }}
    </div>

    <div v-else>
      <div v-for="(setting, index) in settings" :key="index" :class="{ selected: index === selectedIndex }" class="dimmer-setting grid" @click="selectedIndex = index">
        <div class="text-right">{{ setting.name }}</div>
        <div>
          <Icon v-for="(icon, index2) in setting.icons" :key="'icon-' + index2" :type="icon" />
        </div>
      </div>

      <div class="m-down" />

      <div class="text-center">
        <CircularSlider :wrap="true" @diff="dimming">
          <el-button class="clicker -square" @click="click">
            <Icon type="dimmer" />
          </el-button>
        </CircularSlider>
      </div>
    </div>
  </div>
</template>


<script>
import _ from 'lodash';
import { ref, computed } from 'vue';

import ControlHeader from '../../../../components/controls/ControlHeader.vue';
import CircularSlider from '../../../../components/CircularSlider.vue';
import useIotPublish from '../../../../composables/useIotPublish';

export default {
  components: { ControlHeader, CircularSlider },

  props: {
    portId: { type: String },
  },

  setup(props) {
    const { publish } = useIotPublish();

    const selectedIndex = ref(0);

    const settings = computed(() => {
      if (!props.portId) {
        return [];
      }

      const dimmerItems = [];
      // TODO: Read dimmer mechanisms?
      return dimmerItems;
    });

    const throttleSend = _.throttle((ports, payload) => ports.forEach((portId) => publish(payload, { portId })), 200);

    return {
      click() {
        selectedIndex.value = settings.value.length && ((selectedIndex.value + 1) % settings.value.length);
      },

      dimming(dim) {
        const { ports, device, props: dimmerProps } = settings.value[selectedIndex.value] || {};
        if (dim && ports) {
          const action = { [device]: { relative: true } };

          Object.entries(dimmerProps).forEach(([key, value]) => {
            action[device][key] = dim * value;
          });

          if (Object.keys(action[device]).length > 1) {
            throttleSend(ports, action);
          }
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.dimmer-setting {
  grid-template-columns: 1fr 1fr;
  cursor: pointer;

  .icon {
    margin-right: calc(var(--column-gap) / 2);
  }
}

.selected {
  color: rgb(var(--color-nature));
}

.circular-slider {
  margin-top: var(--column-gap);

  &:deep(.arc) {
    stroke: transparent;
  }
}

.circular-slider:hover,
.circular-slider:active {
  &:deep(.arc) {
    stroke: var(--rgba-field-hover);
  }
}

.clicker {
  width: 0;
  height: 0;
  padding: 30%;
  margin: auto;
  pointer-events: auto;
}
</style>
