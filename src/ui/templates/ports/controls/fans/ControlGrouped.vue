<template>
  <div class="grouped-control inline-flex" @click="() => emit('input', !value)">
    <el-switch :value="value" class="m-end" />
    <h4>{{ $t('Grouped control') }}</h4>
  </div>
</template>


<script>
export default {
  props: {
    value: { type: Boolean },
  },

  emits: ['input'],

  setup(props, { emit }) {
    return {
      emit,
    };
  },
};
</script>


<style scoped lang="less">
.grouped-control {
  margin: calc(var(--row-gap) * -1) 0 var(--row-gap);
  cursor: pointer;

  &:hover .el-switch {
    opacity: 1;
  }

  .el-switch {
    opacity: 0.5;
    transition: opacity var(--transition-duration-input);
  }
}
</style>
