<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="port" />
    </template>

    <template #title>
      <span>Port: {{ title }}</span>
    </template>

    <template #tool>
      <template v-if="space && space.id">
        <el-tooltip placement="top" content="Go to space">
          <router-link :to="`/app/manage/${space.id}`" class="el-button -square -common-height -borderless">
            <Icon type="map" />
          </router-link>
        </el-tooltip>
      </template>

      <el-button class="-square -common-height -borderless" @click="fetchAll()">
        <Icon type="refresh" :class="{ rotating: fetching }" />
      </el-button>

      <el-button v-if="!creating && canRemove" class="-square -common-height -borderless" @click="remove">
        <Icon type="bin" />
      </el-button>
    </template>


    <div>
      <Spinner v-if="fetching" />

      <div class="admin-single-grid grid">
        <div>
          <h4 class="admin-header">Details</h4>

          <div class="control-grid no-control-icon" style="row-gap: var(--column-gap);">
            <div>Hardware id</div>
            <div>{{ actual && actual.hwId }}</div>

            <div>Port type</div>
            <div>{{ actual && actual.hwType }}</div>

            <div>Hub</div>
            <div>{{ actual && hubTitle(actual.hubId) }}</div>
          </div>

          <div class="control-grid no-control-icon">
            <label>Port name</label>
            <Field v-bind="generateProps('name')" v-on="generateEvents('name')" />
          </div>
        </div>

        <div>
          <h4 class="admin-header">Information</h4>

          <div class="control-grid no-control-icon">
            <div>Latest data:</div>
            <div>{{ latest[id] && new Date(latest[id]).toLocaleString() }}</div>

            <template v-if="account">
              <div>Account:</div>
              <div>{{ account.name }}</div>
            </template>

            <template v-if="space">
              <div>Space:</div>
              <div>{{ space.name }}</div>

              <div>MQTT data:</div>
              <div style="word-break: break-all;">p/{{ space.accountId }}/{{ (space.attributes && space.attributes.locationId) || space.accountId }}/{{ space.id }}/{{ actual && actual.id }}/{{ SUFFIX.data }}</div>
            </template>
          </div>
        </div>
      </div>

      <div class="admin-blob">
        <h4 class="admin-header">Data blob</h4>

        <JSONEditor
          :json="actual || {}"
          :disabled="!canRemove"
          button-text="Save JSON"
          @save="saveFull"
        />
      </div>
    </div>
  </Pane>
</template>


<script>
import { computed } from 'vue';

import useItem, * as rest from '../../../components/admin/useItem';
import useFetchers from '../../../composables/useFetchers';
import { SUFFIX } from '../../../../modules/iot/topics';
import store from '../../../../modules/ports/store';
import accountsStore from '../../../../modules/accounts/store';
import hubsStore from '../../../../modules/hubs/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  ...rest,

  setup(props, context) {
    const id = computed(() => props.id);

    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
      { store: accountsStore, params: () => hubsStore.getters.find.value({ id: item.actual.value?.hubId })?.accountId },
      { store: hubsStore, params: () => item.actual.value?.hubId },
      { store: spacesStore },
    ]);

    const hub = computed(() => hubsStore.getters.find.value({ id: item.actual.value?.hubId }));

    return {
      ...item,
      ...fetchers,

      emit: context.emit,

      SUFFIX,

      info: store.state.info,
      latest: store.state.latest,

      hub,
      hubTitle: hubsStore.getters.title,

      account: computed(() => accountsStore.getters.find.value({ id: hub.value?.accountId })),
      space: computed(() => spacesStore.getters.findItemSpace.value({ itemId: item.actual.value?.id })),
    };
  },
};
</script>
