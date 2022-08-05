<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="controls" />
    </template>

    <template #title>
      <span>Control scheme: {{ title }}</span>
    </template>

    <template #tool>
      <el-button v-if="!creating && canRemove" class="-square -common-height -borderless" @click="remove">
        <Icon type="bin" />
      </el-button>
    </template>


    <div>
      <Spinner v-if="fetching" />

      <div class="admin-single-grid grid">
        <div>
          <h4 class="admin-header">Details</h4>

          <div class="control-grid no-control-icon">
            <label>Account</label>
            <Field type="select" filterable v-bind="generateProps('accountId')" v-on="generateEvents('accountId')">
              <template #options>
                <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
              </template>
            </Field>
          </div>

          <div class="control-grid no-control-icon">
            <label>Spaces</label>
            <Field type="select" multiple filterable v-bind="generateProps('spaceIds')" v-on="generateEvents('spaceIds')">
              <template #options>
                <el-option v-for="space in spaces" :key="space.id" :label="spaceTitle(space.id)" :value="space.id" />
              </template>
            </Field>
          </div>

          <div v-if="creating" class="m-up text-center">
            <el-button :disabled="isSubmitting" @click="create">Create control scheme</el-button>
          </div>
        </div>

        <div v-if="!creating" />
      </div>

      <div v-if="!creating" class="admin-blob">
        <h4 class="admin-header">Data blob</h4>

        <JSONEditor
          :json="actual || {}"
          :disabled="!canEdit"
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
import store from '../../../../modules/controlschemes/store';
import accountsStore from '../../../../modules/accounts/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  ...rest,

  setup(props, context) {
    const id = computed(() => props.id);

    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
      { store: accountsStore },
    ]);

    return {
      ...item,
      ...fetchers,

      emit: context.emit,

      accounts: accountsStore.state.accounts,
      spaces: computed(() => Object.values(spacesStore.state.spaces).filter((space) => (space.accountId === item.item?.accountId || item.actual.value?.spaceIds?.indexOf(space.id) >= 0))),
      spaceTitle: spacesStore.getters.title,
    };
  },
};
</script>
