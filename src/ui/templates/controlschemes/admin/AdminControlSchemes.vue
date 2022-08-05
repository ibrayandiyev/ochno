<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="controls" />
      </template>

      <template #title>
        <span>Control schemes</span>
      </template>

      <template #tool>
        <AdminFilter v-model="filter" :accounts="accounts" />

        <el-tooltip v-if="canCreate" placement="top" content="Create new control scheme">
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
          <div>Controls</div>
          <div>Account</div>
          <div>Spaces</div>
        </div>

        <AdminEmptyList :filtered="filtered" :filtervalue="filter" :fetching="fetching" />

        <div v-for="controlScheme in filtered" :key="controlScheme.id" class="admin-grid grid no-gap" @click="toggleSelection(controlScheme.id)">
          <div>{{ controlScheme.id }}</div>
          <div>{{ controlScheme.controls && controlScheme.controls.length }}</div>
          <div>{{ accountPath({ id: controlScheme.accountId }, 'name') }}</div>
          <div>{{ spacePaths(controlScheme.spaceIds, 'name').join(', ') }}</div>
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminControlScheme
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
import AdminControlScheme from './AdminControlScheme.vue';
import useFilter from '../../../components/admin/useFilter';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/controlschemes/store';
import accountsStore from '../../../../modules/accounts/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  components: { ...components, AdminControlScheme },
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
      spacePaths: spacesStore.getters.mapPaths,
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(3, 1fr);
}
</Style>
