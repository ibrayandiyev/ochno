<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="users" />
      </template>

      <template #title>
        <span>Users</span>
      </template>

      <template #tool>
        <AdminFilter v-model="filter" :accounts="accounts" />

        <el-tooltip v-if="canCreate" placement="top" content="Create new user">
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
          <div>Email</div>
          <div>Name</div>
          <div>Accounts</div>
          <div>Picture</div>
        </div>

        <AdminEmptyList :filtered="filtered" :filtervalue="filter" :fetching="fetching" />

        <div v-for="user in filtered" :key="user.id" class="admin-grid grid no-gap" @click="toggleSelection(user.id)">
          <div>{{ user.id }}</div>
          <div>{{ user.email }}</div>
          <div>{{ user.profile.fullName }}</div>
          <div>{{ accountRoles(user) }}</div>
          <img class="admin-bg" :src="(user.profile.picture) || ''" loading="lazy">
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminUser
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
import { computed } from 'vue';

import AdminUser from './AdminUser.vue';
import useFilter from '../../../components/admin/useFilter';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/users/store';
import accountsStore from '../../../../modules/accounts/store';

export default {
  components: { ...components, AdminUser },
  emits,

  setup(props, context) {
    return {
      ...useItems({ store }, context), // show, selected, relay, toggleSelection

      ...useFetchers([ // fetching, fetchAll
        { store },
        { store: accountsStore },
      ]),

      ...useFilter({ store }, context), // filter, filtered

      accounts: Object.values(accountsStore.state.accounts),

      // TODO: TAG: RESTRUCTURE
      accountRoles: computed(() => ({ roles = [] }) => roles),
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(2, 1fr) 2fr var(--common-size);
}
</Style>
