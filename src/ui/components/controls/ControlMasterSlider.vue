<template>
  <div class="control-master-slider">
    <template v-if="showMaster">
      <ControlSliders v-bind="parameters" :port-ids="portIds" :text="text" :style="showCollapsed ? 'padding-bottom: calc(var(--row-gap) * 2)' : ''">
        <slot name="master" />
      </ControlSliders>
    </template>

    <template v-if="showCollapsed">
      <el-collapse v-model="expanded" :accordion="true">
        <el-collapse-item name="controls">
          <template #title>
            <div class="grid">
              <h3>{{ $t('Control individually') }}</h3>
            </div>
          </template>

          <ControlSliders v-for="portId in portIds" :key="portId" v-bind="parameters" :port-ids="[portId]">
            <slot name="list" :port-id="portId" />
          </ControlSliders>
        </el-collapse-item>
      </el-collapse>
    </template>

    <template v-if="showIndividual">
      <ControlSliders v-for="portId in portIds" :key="portId" v-bind="parameters" :port-ids="[portId]">
        <slot name="single" :port-id="portId" />
      </ControlSliders>
    </template>
  </div>
</template>


<script>
import { ref, computed } from 'vue';

import ControlSliders from './ControlSliders.vue';

export default {
  components: { ControlSliders },

  props: {
    portIds: { type: Array, default: () => [] },
    deviceType: { type: String, required: true },
    paths: { type: Array },
    text: { type: String },
    customize: { type: Object, default: () => ({}) },
    // {
    //   controls: {
    //     master: { type: Boolean },
    //     collapsed: { type: Boolean },
    //   },
    //   ...see ControlSliders for more.
    // }
  },

  setup(props) {
    const showMaster = computed(() => (props.portIds.length > 1 && props.customize?.controls?.master !== false));
    const showCollapsed = computed(() => (props.portIds.length > 1 && props.customize?.controls?.collapsed !== false));
    // Show individual if it is the only port or if neither master or collapsed list is shown.
    const showIndividual = computed(() => (props.portIds.length <= 1 || (!showMaster.value && !showCollapsed.value)));

    return {
      expanded: ref(''),

      showMaster,
      showCollapsed,
      showIndividual,
      parameters: computed(() => ({
        deviceType: props.deviceType,
        paths: props.paths,
        customize: props.customize,
      })),
    };
  },
};
</script>


<style scoped lang="less">
.el-collapse:deep(.control-sliders) {
   .control-header {
     min-height: auto !important;
     margin: calc(var(--row-gap) * 2) 0 var(--row-gap) !important;
   }

   &:first-child {
      .control-header {
        margin-top: var(--row-gap) !important;
      }
   }

   &:last-child {
     margin-bottom: calc(var(--row-gap) * 2) !important;
   }
}
</style>
