<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="home" />
      </template>

      <template #title>
        <span>Accounts</span>
      </template>

      <template #tool>
        <el-tooltip v-if="canCreate" placement="top" content="Create new account">
          <el-button class="-square -common-height -borderless" @click="toggleSelection('creating')">
            <Icon type="add" />
          </el-button>
        </el-tooltip>

        <el-button class="-square -common-height -borderless" @click="fetchAll()">
          <Icon type="refresh" :class="{ rotating: fetching }" />
        </el-button>
      </template>

      <div class="admin-content">
        <div class="admin-legend grid no-gap">
          <div>Id</div>
          <div>Name</div>
          <div># Groups</div>
          <div>Logo</div>
        </div>

        <AdminEmptyList :filtered="accounts" :fetching="fetching" />

        <div v-for="account in accounts" :key="account.id" class="admin-grid grid no-gap" @click="toggleSelection(account.id)">
          <div>{{ account.id }}</div>
          <div>{{ account.name }}</div>
          <div>{{ account.groups.length }}</div>
          <img class="admin-bg" :src="(account.image) || ''" loading="lazy">
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminAccount
      v-if="selected"
      :id="selected"
      min="250px"
      init="60%"
      @created="toggleSelection($event)"
      @close-pane="toggleSelection(null)"
    />
  </AdjustableGrid>
</template>


<script>
import AdminAccount from './AdminAccount.vue';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/accounts/store';

export default {
  components: { ...components, AdminAccount },
  emits,

  setup(props, context) {
    return {
      ...useItems({ store }, context), // show, selected, relay, toggleSelection

      ...useFetchers([ // fetching, fetchAll
        { store },
      ]),

      accounts: store.state.accounts,
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(2, 1fr) var(--common-size);
}
</Style>
