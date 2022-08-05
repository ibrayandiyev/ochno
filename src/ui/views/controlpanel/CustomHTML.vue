<template>
  <div class="custom-html" @click.prevent="capture" v-html="transformed" />
</template>


<script>
import { computed } from 'vue';

import useLinkMixin from './useLinkMixin';

export default {
  props: {
    html: { type: String },
  },

  setup(props) {
    const { openLink } = useLinkMixin();

    return {
      props,

      transformed: computed(() => props.html && props.html.replaceAll('\n', '<br />')),

      capture(event) {
        if (event.target.href) {
          openLink(event.target.href);
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.custom-html {
  display: grid;
  justify-content: center;
  padding-top: calc(var(--common-size) / 2);
}
</style>
