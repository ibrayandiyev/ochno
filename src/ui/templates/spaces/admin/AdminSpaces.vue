<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="map" />
      </template>

      <template #title>
        <span>Spaces</span>
      </template>

      <template #tool>
        <AdminFilter v-model="filter" :accounts="accounts" />

        <el-tooltip v-if="canCreate" placement="top" content="Create new space">
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
          <div># Items</div>
          <div>Account</div>
          <div>Design</div>
        </div>

        <AdminEmptyList :filtered="filtered" :filtervalue="filter" :fetching="fetching" />

        <div v-for="space in filtered" :key="space.id" class="admin-grid grid no-gap" @click="toggleSelection(space.id)">
          <div>{{ space.id }}</div>
          <div>{{ space.name }}</div>
          <div>{{ space.items.length }}</div>
          <div>{{ accountPath({ id: space.accountId }, 'name') }}</div>
          <img class="admin-bg" :src="(space.attributes && space.attributes.preview) || ''" loading="lazy">
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminSpace
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
import AdminSpace from './AdminSpace.vue';
import useFilter from '../../../components/admin/useFilter';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/spaces/store';
import accountsStore from '../../../../modules/accounts/store';

export default {
  components: { ...components, AdminSpace },
  emits,

  setup(props, context) {
    return {
      ...useItems({ store }, context), // show, selected, relay, toggleSelection

      ...useFetchers([ // fetching, fetchAll
        { store },
        { store: accountsStore },
      ]),

      ...useFilter({ store }, context), // filter, filtered

      accounts: accountsStore.state.accounts,
      accountPath: accountsStore.getters.findPath,
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(3, 1fr) var(--common-size);
}
</Style>
