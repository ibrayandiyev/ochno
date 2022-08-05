<template>
  <img :src="url" class="custom-image" :class="{ 'cursor-pointer': link }" @click="link && openLink(link)">
</template>


<script>
import useLinkMixin from './useLinkMixin';

export default {
  props: {
    url: { type: String },
    link: { type: String },
  },

  setup() {
    const { openLink } = useLinkMixin();

    return {
      openLink,
    };
  },
};
</script>


<style scoped lang="less">
.custom-image {
  display: block;
  max-width: 100%;
  margin: auto;
  padding-top: calc(var(--common-size) / 2);
}
</style>
