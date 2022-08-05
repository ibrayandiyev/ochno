<template>
  <div v-page-title="$t('Setup Hub')" class="usb flex flex-column">
    <div class="text-center font-big2">
      <Icon type="deviceOchnoOperated" />
    </div>

    <div class="flex-grow control-width p-block-s p-block text-center">
      <h1 class="m-down">
        {{ $t('Setup Hub') }}
      </h1>

      <div class="m-down">
        {{ $t('Hub setup is currently only available using the Ochno Management Console.') }}
      </div>

      <a href="https://www.ochno.com/" target="_blank" class="el-button inline-grid">Go to Ochno.com</a>
    </div>
  </div>
</template>


<script>
// This component is loaded by the deprecated Ochno Operated app.
export default {};
</script>


<style scoped lang="less">
.usb {
  min-height: calc(var(--vh, 1vh) * 100);
}

.icon {
  margin: var(--row-gap) 0 calc(var(--row-gap) / 3);
}
</style>
