<template>
  <div>
    <h2 class="m-down">{{ $t('Current configuration') }}</h2>

    <div class="grid">
      <div>{{ $t('Space') }}</div>
      <div>{{ spaceName }}</div>

      <div>{{ $t('Edge serial number') }}</div>
      <div>{{ serial }}</div>

      <div>{{ $t('Remove Edge device') }}</div>
      <div class="text-right">
        <el-button class="-square" @click="$emit('remove')"><Icon type="bin" /></el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    spaceName: { type: String, default: '' },
    serial: { type: String },
  },

  emits: ['remove'],
};
</script>

<style scoped lang="less">
.flex {
  word-break: normal;
  align-items: center;
}

.el-switch {
  margin-left: calc(var(--row-gap) * 2);
}
</style>
