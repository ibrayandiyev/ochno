<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="toolbox" />
      </template>

      <template #title>
        <span>Edges</span>
      </template>

      <template #tool>
        <AdminFilter v-model="filter" :accounts="accounts" />

        <el-tooltip v-if="canCreate" placement="top" content="Create new edge">
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

        <div v-for="edge in filtered" :key="edge.id" class="admin-grid grid no-gap" @click="toggleSelection(edge.id)">
          <div>{{ edge.id }}</div>
          <div>{{ edge.hwId }}</div>
          <div>{{ edge.name }}</div>
          <div>{{ accountPath({ id: edge.accountId }, 'name') }}</div>
          <div>{{ edgeSpace(edge.id) }}</div>
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminEdge
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

import AdminEdge from './AdminEdge.vue';
import useFilter from '../../../components/admin/useFilter';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/edges/store';
import accountsStore from '../../../../modules/accounts/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  components: { ...components, AdminEdge },
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

      edgeSpace: computed(() => (edgeId) => spacesStore.getters.findItemSpace.value({ itemId: edgeId })?.name),
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
