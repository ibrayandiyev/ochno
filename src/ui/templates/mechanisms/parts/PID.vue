<template>
  <el-collapse-item>
    <template #title>
      <div class="drag-handle" />
      <h3 class="title-header">{{ $t('PID controller') }}</h3>
    </template>

    <div class="mechanism-part-wrapper">
      <div class="mechanism-part" />
    </div>
  </el-collapse-item>
</template>

<script>
export const TYPE = 'pid';

export function setup() {
  return {
    type: TYPE,
  };
}

export default {
  components: {},

  props: {
    part: { type: Object, required: true },
  },

  setup() {
    return {
    };
  },
};
</script>


<style scoped lang="less">
</style>
