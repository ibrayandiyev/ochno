<template>
  <el-collapse v-model="expanded" class="mechanism-parts" @change="stopEditing">
    <draggable
      :list="parts"
      :item-key="(element) => parts.findIndex((part) => part === element)"
      group="mechanisms"
      handle=".drag-handle"
      :class="{ 'mechanism-empty': !parts.length }"
      @start="emit('dragging', true)"
      @end="emit('dragging', false)"
    >
      <template #item="{ element, index }">
        <el-collapse-item v-if="Array.isArray(element)" :name="index">
          <template #title>
            <div class="drag-handle" />
            <h4 class="title-header part-container">{{ $t('Container') }}</h4>
            <!-- <span class="title-header">{{ element.length }}</span> -->
            <span class="title-header part-container font-smaller"><MechanismIcons :parts="element" /></span>
          </template>

          <mechanism-parts :parts="element" class="mechanism-part-wrapper" @dragging="emit('dragging', $event)" />
        </el-collapse-item>

        <el-collapse-item v-else-if="!components[element.type]" :name="index">
          <template #title>
            <div class="grid">
              <div class="drag-handle" />
              <h4 class="title-header"><span class="color-error">{{ $t('Unknown part') }}</span></h4>
            </div>
          </template>
        </el-collapse-item>

        <component :is="element.type" v-else :name="index" :part="element" />
      </template>
    </draggable>
  </el-collapse>
</template>


<script>
import _ from 'lodash';
import draggable from 'vuedraggable';
import { ref, watch, nextTick } from 'vue';

import MechanismIcons from './MechanismIcons.vue';
import { components } from './parts';
import workspaceStore from '../../../modules/workspace/store';

export default {
  components: { ...components, draggable, MechanismIcons },

  props: {
    parts: { type: Array },
  },

  emits: ['dragging', 'expand'],

  setup(props, { emit }) {
    const expanded = ref([]);

    watch(
      () => _.flattenDeep(props.parts).length,
      (newValue, oldValue) => {
        if (newValue > oldValue) {
          nextTick(() => {
            expanded.value.push(newValue - 1);
            emit('expand');
          });
        }
      },
    );

    return {
      components,
      emit,

      expanded,

      stopEditing() {
        workspaceStore.dispatch.clear(['editing']);
      },
    };
  },
};
</script>


<style scoped lang="less">
.mechanism-empty {
  min-height: var(--row-gap);
}

.mechanism-parts:deep(.mechanism-part-wrapper) {
  background: rgba(var(--color-gray-3), var(--opacity-light));
}

.mechanism-parts:deep(.mechanism-parts) {
  border-left: var(--column-gap) solid rgba(var(--color-gray-3), var(--opacity-medium));
}

.mechanism-parts:deep(.mechanism-part) {
  padding: var(--row-gap) 10%;
}

.part-container {
  color: rgb(var(--color-gray-4));

  + .part-container {
    margin-left: var(--column-gap) !important;
  }
}
</style>
