<template>
  <el-tooltip placement="top" :content="$t('Select in map')">
    <el-checkbox :model-value="isActive" class="-circle" @change="toggleEditing">
      <Icon type="map" />
    </el-checkbox>
  </el-tooltip>
</template>


<script>
import { computed, watch, onUnmounted } from 'vue';

import emitter from '../utils/emitter';
import workspaceStore from '../../modules/workspace/store';

let current = null; // "Global" variable to keep track of what selection is active.

export default {
  props: {
    itemIds: { type: Array, default: () => [] },
    multi: { type: Boolean, default: true },
    // TODO: TAG: RESTRUCTURE Limit the available select types?
  },

  emits: ['items-change'],

  setup(props, { emit }) {
    const isActive = computed(() => workspaceStore.state.editing && current === props);

    const startMapSelect = () => {
      current = props;

      workspaceStore.dispatch.set({
        tool: props.multi ? 'multi' : undefined,
        container: 'editing',
        selectable: 'port',
        editing: { itemIds: props.itemIds }, // NOTE: Using references here!
      });

      emitter.$emit('set-pane', 'space');
    };

    const stopMapSelect = () => {
      if (current === props) {
        current = null;
        workspaceStore.dispatch.clear(['tool', 'container', 'selectable', 'editing']); // This will trigger the watch in the start function.
      }
    };

    const toggleEditing = () => (isActive.value ? stopMapSelect() : startMapSelect());

    watch(
      () => props.itemIds,
      () => isActive.value && startMapSelect(),
      { immediate: true },
    );

    watch(
      () => workspaceStore.state.editing?.itemIds,
      () => {
        if (current === props) {
          emit('items-change', props.itemIds);
        }
      },
    );

    onUnmounted(() => {
      stopMapSelect();
    });

    return {
      isActive,

      toggleEditing,
    };
  },
};

</script>


<style scoped lang="less">
</style>
