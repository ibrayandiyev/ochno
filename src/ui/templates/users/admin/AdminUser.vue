<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="user" />
    </template>

    <template #title>
      <span>User: {{ title }}</span>
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
            <template v-if="!creating">
              <label>Full name</label>
              <Field v-bind="generateProps('profile.fullName')" v-on="generateEvents('profile.fullName')" />
            </template>

            <label>Email</label>
            <Field type="email" v-bind="generateProps('email')" v-on="generateEvents('email')" />

            <label>{{ creating ? 'Password' : 'Set password' }}</label>
            <Field type="password" v-bind="generateProps('password')" :message="passwordError" auto-complete="new-password" v-on="generateEvents('password')" />

            <template v-if="!creating">
              <label>Photo</label>
              <Upload
                :disabled="!canEdit || isSubmitting || isUploading"
                :uploading="isUploading"
                :image="actual && actual.profile && actual.profile.picture"
                @input="upload('postPicture', $event)"
                @remove="removeProperty('profile.picture')"
              />
            </template>
          </div>

          <div v-if="creating" class="m-up text-center">
            <el-button :disabled="isSubmitting" @click="create">Create user</el-button>
          </div>
        </div>

        <div v-if="!creating">
          <h4 class="admin-header">Permissions</h4>
          <!-- TODO: TAG: RESTRUCTURE -->
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
import { computed } from 'vue';

import useItem, * as rest from '../../../components/admin/useItem';
import useFetchers from '../../../composables/useFetchers';
import useValidate from '../../../composables/useValidate';
import store from '../../../../modules/users/store';

const passwordValidation = store.validation.pick(['password']);

export default {
  ...rest,

  setup(props, context) {
    const id = computed(() => props.id);

    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
    ]);
    const passwordValidate = useValidate({ data: item.item, schema: passwordValidation });

    return {
      ...item,
      ...fetchers,

      emit: context.emit,

      passwordError: computed(() => item.item?.password && passwordValidate.errors.password),
    };
  },
};
</script>


<style scoped lang="less">
.role-grid {
  grid-template-columns: 1fr 1fr auto;
  justify-content: center;
}
</style>
