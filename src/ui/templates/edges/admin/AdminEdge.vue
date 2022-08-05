<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="toolbox" />
    </template>

    <template #title>
      <span>Edge: {{ title }}</span>
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
            <label>Hardware id</label>
            <Field v-bind="generateProps('hwId')" v-on="generateEvents('hwId')" />

            <label>Edge name</label>
            <Field v-bind="generateProps('name')" v-on="generateEvents('name')" />

            <label>Account</label>
            <Field type="select" filterable v-bind="generateProps('accountId')" v-on="generateEvents('accountId')">
              <template #options>
                <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
              </template>
            </Field>
          </div>

          <div v-if="creating" class="m-up text-center">
            <el-button :disabled="isSubmitting" @click="create">Create edge</el-button>
          </div>
        </div>

        <div v-if="!creating">
          <h4 class="admin-header">Actions</h4>

          <div class="control-grid no-control-icon">
            <div />
            <el-button :disabled="redeploying" @click="redeploy">Force redeploy</el-button>
          </div>
        </div>
      </div>

      <div v-if="!creating" class="admin-blob">
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
import { ref, computed } from 'vue';

import useItem, * as rest from '../../../components/admin/useItem';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/edges/store';
import accountsStore from '../../../../modules/accounts/store';

export default {
  ...rest,

  setup(props, context) {
    const redeploying = ref(false);
    const id = computed(() => props.id);

    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
      { store: accountsStore },
    ]);

    return {
      ...item,
      ...fetchers,

      redeploying,
      emit: context.emit,

      accounts: accountsStore.state.accounts,

      redeploy: async () => {
        redeploying.value = true;
        try {
          await store.dispatch.putDeploy({ id: id.value });
        } catch (err) {
          this.showError(err);
        }
        redeploying.value = false;
      },
    };
  },
};
</script>
