<template>
  <el-scrollbar ref="scrollbar" v-resize.debounce="() => scrollbar && scrollbar.update()">
    <slot />
  </el-scrollbar>
</template>


<script>
import { ref } from 'vue';

export default {
  props: {
    hide: { type: Boolean },
  },

  setup() {
    return {
      scrollbar: ref(null),
    };
  },
};
</script>


<style lang="less">
// NOT SCOPED.
.el-scrollbar {
  --el-scrollbar-background-color: rgb(var(--color-gray-5));
  --el-scrollbar-opacity: 0.3;
  --el-scrollbar-hover-background-color: rgb(var(--color-gray-5));
  --el-scrollbar-hover-opacity: 0.6;
}

.scrollbar-fill {
  .el-scrollbar__view {
    height: 100%;
  }
}
</style>
