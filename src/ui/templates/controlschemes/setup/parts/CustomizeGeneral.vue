<template>
  <el-collapse-item :class="classes">
    <template #title>
      <div class="drag-handle" />
      <Icon :type="decoration.icon" class="title-header" />
      <div class="title-header">{{ decoration.name }}</div>
    </template>

    <slot></slot>
  </el-collapse-item>
</template>


<script>
import { computed } from 'vue';

import customizePart from '../customizePart';

export default {
  props: {
    control: { type: Object },
  },

  setup(props, { slots }) {
    return {
      classes: computed(() => (slots.default?.()?.[0]?.children ? '' : 'no-component')),

      decoration: computed(() => customizePart(props.control)),
    };
  },
};
</script>


<style scoped lang="less">
</style>
