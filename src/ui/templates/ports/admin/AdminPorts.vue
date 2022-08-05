<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="port" />
      </template>

      <template #title>
        <span>Ports</span>
      </template>

      <template #tool>
        <AdminFilter v-model="filter" :accounts="accounts" :hubs="hubs" />

        <el-button class="-square -common-height -borderless" @click="fetchAll()">
          <Icon type="refresh" :class="{ rotating: fetching }" />
        </el-button>
      </template>

      <div class="admin-content">
        <div class="admin-legend grid no-gap">
          <div>Id</div>
          <div>Device</div>
          <div>Hw id</div>
          <div>Hw type</div>
          <div>Name</div>
          <div>Account</div>
          <div>Space</div>
          <div>Hub</div>
        </div>

        <AdminEmptyList :filtered="filtered" :filtervalue="filter" :fetching="fetching" />

        <div v-for="port in filtered" :key="port.id" class="admin-grid grid no-gap" @click="toggleSelection(port.id)">
          <div>{{ port.id }}</div>
          <Icon :type="info[port.id].icon" default="port" class="font-small1" />
          <div>{{ port.hwId }}</div>
          <div>{{ port.hwType }}</div>
          <div>{{ port.name || info[port.id].name }}</div>
          <div>{{ accountPath({ id: hubPath({ id: port.hubId }, 'accountId') }, 'name') }}</div>
          <div>{{ portSpace(port.id) }}</div>
          <div>{{ hubPath({ id: port.hubId }, 'name') || hubPath({ id: port.hubId }, 'hwId') }}</div>
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminPort
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

import AdminPort from './AdminPort.vue';
import useFilter from '../../../components/admin/useFilter';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/ports/store';
import accountsStore from '../../../../modules/accounts/store';
import hubsStore from '../../../../modules/hubs/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  components: { ...components, AdminPort },
  emits,

  setup(props, context) {
    return {
      ...useItems({ store }, context), // show, selected, relay, toggleSelection

      ...useFetchers([ // fetching, fetchAll
        { store },
        { store: accountsStore },
        { store: hubsStore },
        { store: spacesStore },
      ]),

      ...useFilter({ store }, context), // filter, filtered

      info: store.state.info,

      accounts: accountsStore.state.accounts,
      accountPath: accountsStore.getters.findPath,
      hubs: hubsStore.state.hubs,
      hubPath: hubsStore.getters.findPath,

      portSpace: computed(() => (portId) => spacesStore.getters.findItemSpace.value({ itemId: portId })?.name),
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(3, var(--common-size)) repeat(4, 1fr);
}
</Style>
