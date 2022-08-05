<template>
  <div>
    <h2 class="margin-block-row">Uploader</h2>

    <h3 class="margin-block-column">Initial</h3>
    <Upload style="height: 10rem" />

    <h3 class="margin-block-column">With value</h3>
    <Upload image="./favicon/Ochno-Favicon-228.png" style="height: 10rem" />

    <h3 class="margin-block-column">Disabled</h3>
    <Upload :disabled="true" style="height: 10rem" />

    <h3 class="margin-block-column">Uploading</h3>
    <Upload :uploading="true" style="height: 10rem" />
  </div>
</template>


<script>
import Upload from '../../components/Upload.vue';

export default {
  components: { Upload },
};
</script>


<style scoped lang="less">
</style>
