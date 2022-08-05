<template>
  <div>
    <h2 class="margin-block-row">JSON editor</h2>

    <h3 class="margin-block-column">Readable</h3>
    <JSONEditor :json="{ string: 'string', number: 12345, boolean: true, array: [1, 2, 'string', false, [], {}], object: { test: 'You rock!' } }" />

    <h3 class="margin-block-column">Writable</h3>
    <JSONEditor :json="{ value: 'Editable' }" :disabled="false" button-text="Optional save text" />
  </div>
</template>


<script>
import JSONEditor from '../../components/JSONEditor.vue';

export default {
  components: { JSONEditor },
};
</script>


<style scoped lang="less">
</style>
