<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="home" />
    </template>

    <template #title>
      <span>Account: {{ title }}</span>
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
            <label>Account name</label>
            <Field v-bind="generateProps('name')" v-on="generateEvents('name')" />

            <template v-if="!creating">
              <label>Image</label>
              <Upload
                :disabled="!canEdit || isSubmitting || isUploading"
                :uploading="isUploading"
                :image="actual && actual.image"
                @input="upload('postImage', $event)"
                @remove="removeProperty('image')"
              />
            </template>
          </div>

          <div v-if="creating" class="m-up text-center">
            <el-button :disabled="isSubmitting" @click="create">Create account</el-button>
          </div>
        </div>

        <div v-if="!creating">
          <h4 class="admin-header">Information</h4>

          <div class="control-grid no-control-icon">
            <div>MQTT:</div>
            <div style="word-break: break-all;">p/{{ actual.id }}/#</div>
          </div>

          <h4 class="admin-header">Access groups</h4>

          <Spinner v-if="fetchingAuth" />
          <div v-else>
            <div v-for="(group, index) in item.groups" :key="group.id" class="m-down-2">
              <Field v-bind="generateProps(`groups[${index}].name`)" class="m-auto" v-on="groupEvents(group.id, index, 'name')" />

              <AdminAccountGroup :account-id="id" :group-id="group.id" :authorisation="authorisations[group.authorisationId]" />
            </div>
          </div>
        </div>
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
import _ from 'lodash';
import { normalize, schema } from 'normalizr';
import { ref, reactive, computed, watchEffect } from 'vue';

import AdminAccountGroup from './AdminAccountGroup.vue';
import useItem, * as rest from '../../../components/admin/useItem';
import useFetchers from '../../../composables/useFetchers';
import { showError } from '../../../utils/error';
import store from '../../../../modules/accounts/store';

const normalization = new schema.Entity('groups');

export default {
  ...rest,

  components: { ...rest.components, AdminAccountGroup },

  setup(props, context) {
    const id = computed(() => props.id);
    const fetchingAuth = ref(false);
    const authorisations = reactive({});

    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
    ]);

    watchEffect(async () => {
      if (!item.creating.value && id.value) {
        try {
          fetchingAuth.value = true;
          const auths = await store.dispatch.groups.get({ id: id.value });
          auths.filter(({ ownerId }) => ownerId === id.value).forEach((auth) => {
            const { entities } = normalize(auth, normalization);
            Object.assign(authorisations, entities.groups);
          });
        } catch (error) {
          console.warn(error); // eslint-disable-line no-console
        }
        fetchingAuth.value = false;
      }
    });

    return {
      ...item,
      ...fetchers,

      emit: context.emit,

      authorisations,
      fetchingAuth,

      groupEvents: (groupId, index, prop) => {
        const path = `groups[${index}].${prop}`;
        return {
          'input:modelValue': (val) => _.set(item.item, path, val),
          'update:modelValue': async (val) => {
            _.set(item.item, path, val);
            try {
              await store.dispatch.groups.put({ id: id.value, groupId, data: { [prop]: val } });
            } catch (error) {
              showError(error);
            }
          },
        };
      },
    };
  },
};
</script>
