<template>
  <div>
    <h2 class="margin-block-row">On/Off input</h2>

    <h3 class="margin-block-column">Checkboxes</h3>
    <div class="grid grid-flow-column m-down">
      <div>
        <el-checkbox v-model="checkbox">Remember me</el-checkbox>
        <el-checkbox :model-value="checkbox" @input="checkbox = !checkbox">:value</el-checkbox>
        <el-checkbox v-model="checkbox" disabled>Disabled</el-checkbox>
      </div>
      <div>
        <el-checkbox v-model="checkbox" class="-circle"><Icon type="light" /></el-checkbox>
        <el-checkbox v-model="checkbox" disabled class="-circle"><Icon type="light" /></el-checkbox>
      </div>
      <div>
        <el-checkbox v-model="checkbox" class="-square"><Icon type="light" /></el-checkbox>
        <el-checkbox v-model="checkbox" disabled class="-square"><Icon type="light" /></el-checkbox>
      </div>
    </div>

    <h3 class="margin-block-column">Radio buttons</h3>
    <div class="grid grid-flow-column m-down">
      <div>
        <el-radio v-model="radio" label="1">First</el-radio>
        <el-radio :model-value="radio" label="2" @input="radio = '2'">Second</el-radio>
        <el-radio v-model="radio" label="3" disabled>Disabled</el-radio>
      </div>
      <div>
        <el-radio v-model="radio" label="1" class="-circle"><Icon type="light" /></el-radio>
        <el-radio v-model="radio" label="2" class="-circle"><Icon type="temp" /></el-radio>
        <el-radio v-model="radio" label="3" disabled class="-circle"><Icon type="vision" /></el-radio>
      </div>
      <div>
        <el-radio v-model="radio" label="1" class="-square">1</el-radio>
        <el-radio v-model="radio" label="2" class="-square"><Icon type="light" /></el-radio>
        <el-radio v-model="radio" label="3" class="-square" disabled>Off</el-radio>
      </div>
    </div>

    <h3 class="margin-block-column">Switches</h3>
    <div>
      <el-switch v-model="switchValue" />
      <el-switch v-model="switchValue" inactive-text="Off" active-text="On" />
      <el-switch v-model="switchValue" active-text="Only on text" />
      <el-switch v-model="switchValue" inactive-text="Only off text" />
      <el-switch :value="switchValue" active-text=":value" @input="switchValue = false" />
      <el-switch v-model="switchValue" active-text="Disabled" disabled />
    </div>
  </div>
</template>


<script>
import { ref } from 'vue';

export default {
  setup() {
    return {
      checkbox: ref(false),
      radio: ref(null),
      switchValue: ref(false),
    };
  },
};
</script>


<style scoped lang="less">
</style>
