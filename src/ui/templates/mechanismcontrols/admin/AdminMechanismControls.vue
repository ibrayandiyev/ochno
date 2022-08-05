<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="toolbox" />
      </template>

      <template #title>
        <span>Mechanism controls</span>
      </template>

      <template #tool>
        <AdminFilter v-model="filter" :accounts="accounts" :spaces="spaces" />

        <el-tooltip v-if="canCreate" placement="top" content="Create new mechanism control">
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
          <div># controls</div>
          <div>Account</div>
          <div>Space</div>
          <div>Mechanisms</div>
        </div>

        <AdminEmptyList :filtered="filtered" :filtervalue="filter" :fetching="fetching" />

        <div v-for="mechanismControl in filtered" :key="mechanismControl.id" class="admin-grid grid no-gap" @click="toggleSelection(mechanismControl.id)">
          <div>{{ mechanismControl.id }}</div>
          <div>{{ mechanismControl.name }}</div>
          <div>{{ $_.get(mechanismControl, 'controls.length', 0) }}</div>
          <div>{{ accountPath({ id: spacePath({ id: mechanismControl.spaceId }, 'accountId') }, 'name') }}</div>
          <div>{{ spacePath({ id: mechanismControl.spaceId }, 'name') }}</div>
          <div>{{ mechanismPaths(mechanismControl.mechanismIds, 'name').join(', ') }}</div>
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminMechanismControl
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
import AdminMechanismControl from './AdminMechanismControl.vue';
import useFilter from '../../../components/admin/useFilter';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/mechanismcontrols/store';
import accountsStore from '../../../../modules/accounts/store';
import mechanismsStore from '../../../../modules/mechanisms/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  components: { ...components, AdminMechanismControl },
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
      spaces: spacesStore.state.spaces,
      spacePath: spacesStore.getters.findPath,
      mechanismPaths: mechanismsStore.getters.mapPaths,
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(5, 1fr);
}
</Style>
