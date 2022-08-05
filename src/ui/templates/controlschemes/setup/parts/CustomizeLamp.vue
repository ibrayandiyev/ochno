<template>
  <CustomizeGeneral :control="control">
    <div class="info-wrapper p-block">
      <CustomizeHeader :control="control" class="m-down" />
      <CustomizeSliders :control="control" />
    </div>
  </CustomizeGeneral>
</template>


<script>
import CustomizeGeneral from './CustomizeGeneral.vue';
import CustomizeHeader from '../CustomizeHeader.vue';
import CustomizeSliders from '../CustomizeSliders.vue';
import * as rest from '../usePropertySetter';

export default {
  ...rest,

  components: { CustomizeHeader, CustomizeGeneral, CustomizeSliders },

  setup() {
    return {
    };
  },
};

</script>


<style scoped lang="less">
</style>
