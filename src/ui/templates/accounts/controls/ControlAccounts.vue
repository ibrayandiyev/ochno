<template>
  <el-tabs v-model="activeTab" type="card">
    <template v-for="id in accountIds" :key="id">
      <el-tab-pane :name="id" :lazy="true">
        <template #label>
          {{ title(id) }}
        </template>

        <ControlAccount :account-id="id" class="m-down-common" />
      </el-tab-pane>
    </template>
  </el-tabs>
</template>


<script>
import { ref } from 'vue';

import ControlAccount from './ControlAccount.vue';
import accountsStore from '../../../../modules/accounts/store';

export default {
  components: { ControlAccount },

  setup() {
    return {
      activeTab: ref(accountsStore.state.ids[0]),
      accountIds: accountsStore.state.ids,
      title: accountsStore.getters.title,
    };
  },
};
</script>


<style scoped lang="less">

</style>
