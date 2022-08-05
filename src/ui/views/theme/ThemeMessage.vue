<template>
  <div>
    <h2 class="margin-block-row">Info</h2>
    <div class="grid">
      <AlertBar text="Info message" />
      <AlertBar>
        With additional icon
        <Icon type="light" />
      </AlertBar>
    </div>

    <h2 class="margin-block-row">Modals</h2>
    <el-button @click="messageBoxConfirm">Confirm modal</el-button>
    <el-button @click="messageBoxAlert">Alert modal</el-button>
  </div>
</template>


<script>
import { ElMessageBox } from 'element-plus';

import AlertBar from '../../components/AlertBar.vue';

export default {
  components: { AlertBar },

  setup() {
    return {
      messageBoxConfirm(text = 'Click any button, or outside, to close.') {
        ElMessageBox.confirm(text, 'Message box', {
          cancelButtonText: 'No',
          confirmButtonText: 'Yes',
        }).then(() => console.log('Message box confirm'), () => console.log('Message box cancel')); // eslint-disable-line no-console
      },

      messageBoxAlert(text = 'Click the button to close.') {
        return ElMessageBox.alert(text, 'Message box', {
          confirmButtonText: 'OK',
        }).then(() => console.log('Message box confirm'), () => console.log('Message box cancel')); // eslint-disable-line no-console
      },
    };
  },
};
</script>


<style scoped lang="less">
</style>
