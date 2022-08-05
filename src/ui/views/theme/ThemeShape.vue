<template>
  <div>
    <h2 class="margin-block-row">Shapes</h2>

    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(50px, 450px)); column-gap: 5rem;">
      <div>
        <h3 class="margin-block-column">Circular</h3>
        <div class="grid grid-flow-column">
          <span class="-circle bg-gray-2">0</span>
          <span class="-circle bg-gray-3"><Icon type="light" /></span>
          <span class="-circle -common-height bg-gray-2">0</span>
          <span class="-circle -common-height bg-gray-3"><Icon type="light" /></span>
          <span class="-circle bg-gray-3">Fixed width</span>
          <span class="-circular bg-gray-3" style="padding: 1rem;">Dynamic width</span>
        </div>
      </div>

      <div>
        <h3 class="margin-block-column">Quadratic</h3>
        <div class="grid grid-flow-column">
          <span class="-square bg-gray-3">0</span>
          <span class="-square bg-gray-2"><Icon type="light" /></span>
          <span class="-square -common-height bg-gray-3">0</span>
          <span class="-square -common-height bg-gray-2"><Icon type="light" /></span>
          <span class="-square bg-gray-3">Fixed width</span>
          <span class="-quadratic bg-gray-3" style="padding: 1rem;">Dynamic width</span>
        </div>
      </div>
    </div>

    <h3 class="margin-block-column">Dashed Line</h3>
    <DashedLine />
  </div>
</template>


<script>
import DashedLine from '../../components/DashedLine.vue';

export default {
  components: { DashedLine },
};
</script>


<style scoped lang="less">
</style>
