<template>
  <h3 class="alert-bar flex p-block-s bg-error">
    <Icon type="info" class="m-end p-start" />
    <span><slot>{{ text }}</slot></span>
  </h3>
</template>


<script>
export default {
  props: {
    text: { type: String },
  },
};
</script>


<style scoped lang="less">
.p-block-s {
  padding-top: var(--column-gap);
  padding-bottom: var(--column-gap);
}
</style>
