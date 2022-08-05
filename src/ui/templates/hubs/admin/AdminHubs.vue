<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="hub" />
      </template>

      <template #title>
        <span>Hubs</span>
      </template>

      <template #tool>
        <AdminFilter v-model="filter" :accounts="accounts" />

        <el-tooltip v-if="canCreate" placement="top" content="Create new hub">
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
          <div>Hardware id</div>
          <div>Name</div>
          <div>Account</div>
          <div>Spaces</div>
        </div>

        <AdminEmptyList :filtered="filtered" :filtervalue="filter" :fetching="fetching" />

        <div v-for="hub in filtered" :key="hub.id" class="admin-grid grid no-gap" @click="toggleSelection(hub.id)">
          <div>{{ hub.id }}</div>
          <div>{{ hub.hwId }}</div>
          <div>{{ hub.name }}</div>
          <div>{{ accountPath({ id: hub.accountId }, 'name') }}</div>
          <div>{{ hubSpace(hub.id) }}</div>
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminHub
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

import AdminHub from './AdminHub.vue';
import useFilter from '../../../components/admin/useFilter';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/hubs/store';
import accountsStore from '../../../../modules/accounts/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  components: { ...components, AdminHub },
  emits,

  setup(props, context) {
    return {
      ...useItems({ store }, context), // show, selected, relay, toggleSelection

      ...useFetchers([ // fetching, fetchAll
        { store },
        { store: accountsStore },
        { store: spacesStore },
      ]),

      ...useFilter({ store }, context), // filter, filtered

      accounts: accountsStore.state.accounts,
      accountPath: accountsStore.getters.findPath,

      hubSpace: computed(() => (hubId) => spacesStore.getters.findItemSpace.value({ itemId: hubId })?.name),
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(3, 1fr) 2fr;
}
</Style>
