<template>
  <div class="control-sections control-width">
    <ControlHeader device-type="ochnoOperated">
      <h3>{{ $t('Sections') }}</h3>
    </ControlHeader>

    <ControlSection v-for="sectionId in sectionIds" :key="sectionId" :section-id="sectionId" :space="space" />
  </div>
</template>


<script>
import ControlSection from './ControlSection.vue';
import ControlHeader from '../../../../components/controls/ControlHeader.vue';

export default {
  components: { ControlSection, ControlHeader },

  props: {
    sectionIds: { type: Array, required: true },
    space: { type: Object, required: true },
  },
};
</script>


<style scoped lang="less">
</style>
