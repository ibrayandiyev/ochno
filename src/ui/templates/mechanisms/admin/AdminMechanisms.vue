<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="toolbox" />
      </template>

      <template #title>
        <span>Mechanisms</span>
      </template>

      <template #tool>
        <AdminFilter v-model="filter" :accounts="accounts" :spaces="spaces" />

        <el-tooltip v-if="canCreate" placement="top" content="Create new mechanism">
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
          <div># Parts</div>
          <div>Account</div>
          <div>Space</div>
        </div>

        <AdminEmptyList :filtered="filtered" :filtervalue="filter" :fetching="fetching" />

        <div v-for="mechanism in filtered" :key="mechanism.id" class="admin-grid grid no-gap" @click="toggleSelection(mechanism.id)">
          <div>{{ mechanism.id }}</div>
          <div>{{ title(mechanism.id) }}</div>
          <div>{{ $_.get(mechanism, 'parts.length', 0) }}</div>
          <div>{{ accountPath({ id: spacePath({ id: mechanism.spaceId }, 'accountId') }, 'name') }}</div>
          <div>{{ spacePath({ id: mechanism.spaceId }, 'name') }}</div>
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminMechanism
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
import AdminMechanism from './AdminMechanism.vue';
import useFilter from '../../../components/admin/useFilter';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/mechanisms/store';
import accountsStore from '../../../../modules/accounts/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  components: { ...components, AdminMechanism },
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

      title: store.getters.title,
      accounts: accountsStore.state.accounts,
      accountPath: accountsStore.getters.findPath,
      spaces: spacesStore.state.spaces,
      spacePath: spacesStore.getters.findPath,
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(4, 1fr);
}
</Style>
