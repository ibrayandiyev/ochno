<template>
  <div class="map-controls flex-space-between flex-column" :class="classes">
    <div>
      <div class="tool-grid grid no-gap m-down">
        <el-tooltip placement="left" :content="$t('Multi select')" popper-class="is-disabled">
          <el-checkbox :model-value="tool === TOOLS.multi" class="map-control -circle" @change="setTool(TOOLS.multi)">
            <Icon type="multiSelect" />
          </el-checkbox>
        </el-tooltip>
        <el-tooltip placement="left" :content="$t('Box select')" popper-class="is-disabled">
          <el-checkbox :model-value="tool === TOOLS.box" class="map-control -circle" @change="setTool(TOOLS.box)">
            <Icon type="selectionSquare" />
          </el-checkbox>
        </el-tooltip>
      </div>

      <div class="tool-grid grid no-gap">
        <el-tooltip placement="left" :content="$t('Move items')" popper-class="is-disabled">
          <el-checkbox :model-value="tool === TOOLS.move" class="map-control -circle" @change="setTool(TOOLS.move)">
            <Icon type="move" />
          </el-checkbox>
        </el-tooltip>
        <!-- <el-tooltip placement="left" :content="$t('Draw new sections')" popper-class="is-disabled">
          <el-checkbox :model-value="tool === TOOLS.drawSection" class="map-control -circle" @change="setTool(TOOLS.drawSection)">
            <Icon type="section" />
          </el-checkbox>
        </el-tooltip> -->
      </div>
    </div>

    <div>
      <el-button class="zoom-in map-control -circle -borderless" @click.prevent.stop="rootEmit('map-zoom-in')">
        <Icon type="add" />
      </el-button>
      <el-button class="zoom-out map-control -circle -borderless" @click.prevent.stop="rootEmit('map-zoom-out')">
        <Icon type="minus" />
      </el-button>
      <el-button class="zoom-all map-control -circle -borderless" @click.prevent.stop="rootEmit('map-zoom-fit')">
        <Icon type="collapse" />
      </el-button>
    </div>
  </div>
</template>


<script>
import { computed } from 'vue';

import emitter from '../../../utils/emitter';
import workspaceStore, { TOOLS } from '../../../../modules/workspace/store';

export default {
  setup() {
    const { hasChoice } = workspaceStore.getters;

    return {
      TOOLS,

      tool: computed(() => workspaceStore.state.tool),

      classes: computed(() => ({ 'color-primary-inverted': hasChoice.value['has-editing'] || hasChoice.value['has-highlighting'] })),

      setTool(value) {
        const tool = value === workspaceStore.state.tool ? null : value;
        workspaceStore.dispatch.set({ tool });
      },

      rootEmit(eventName) {
        emitter.$emit(eventName); // Emitting with the root emitter, no need to define in component.
      },
    };
  },
};
</script>


<style scoped lang="less">
.map-controls {
  align-items: flex-end;
  margin: var(--field-size) 0;
  pointer-events: none;
}

.map-control {
  display: flex;
  justify-content: center;
  width: var(--field-size);
  height: var(--field-size);
  margin: 0.25em 0;
  border-radius: calc(var(--field-size) / 3) 0 0 calc(var(--field-size) / 3);
  background-color: rgb(var(--color-gray-3)) !important;

  &:not(.is-disabled) {
    pointer-events: auto;
  }

  &.el-checkbox {
    &.is-checked {
      background-color: rgb(var(--color-primary)) !important;
    }
  }
}
</style>
