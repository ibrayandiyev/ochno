<template>
  <div class="container grid no-gap p-block p-inline bg-black" style="grid-template-rows: 0.5fr 1fr auto">
    <div class="centered">
      <div class="m-down">
        <Icon type="deviceOchnoOperated" class="title-icon" />
      </div>
      <div class="h3">{{ $t('Ochno Operated') }}</div>
    </div>

    <div class="main text-center">
      <slot />
    </div>

    <div class="footer text-center">
      <slot name="footer" />
    </div>
  </div>
</template>


<script>
export default {};
</script>


<style scoped lang="less">
.container {
  position: relative;
  align-items: stretch;
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-controls);
  min-height: 100%;
}

.title-icon {
  font-size: 3.5rem;
}
</style>
