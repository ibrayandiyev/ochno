<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="map" />
    </template>

    <template #title>
      <span>Space: {{ title }}</span>
    </template>

    <template #tool>
      <template v-if="url">
        <el-tooltip placement="top" content="Go to space">
          <router-link :to="url" class="el-button -square -common-height -borderless">
            <Icon type="map" />
          </router-link>
        </el-tooltip>
      </template>

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
            <label>Space name</label>
            <Field v-bind="generateProps('name')" v-on="generateEvents('name')" />

            <label>Account</label>
            <Field type="select" filterable v-bind="generateProps('accountId')" v-on="generateEvents('accountId')">
              <template #options>
                <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
              </template>
            </Field>

            <template v-if="!creating && actual">
              <label>Items</label>
              <div>{{ actual.items && actual.items.length }}</div>

              <div />
              <div />

              <div>QR Code</div>
              <div>
                <a :href="qrSvg" :download="actual.name + ' qrcode.svg'" :class="{ 'is-disabled': !qrSvg }" class="m-end">
                  <el-button>SVG</el-button>
                </a>
                <a :href="qrPng" :download="actual.name + ' qrcode.png'" :class="{ 'is-disabled': !qrPng }">
                  <el-button>PNG</el-button>
                </a>
              </div>

              <div>MQTT:</div>
              <div style="word-break: break-all;">p/{{ actual.accountId }}/{{ (actual.attributes && actual.attributes.locationId) || actual.id }}/{{ actual.id }}/#</div>
            </template>
          </div>

          <div v-if="creating" class="m-up text-center">
            <el-button :disabled="isSubmitting" @click="create">Create space</el-button>
          </div>
        </div>

        <div v-if="!creating" class="flex flex-column">
          <h4 class="admin-header">Design/image</h4>
          <Upload
            :disabled="!canEdit || isSubmitting || isUploading"
            :uploading="isUploading"
            :image="actual && actual.attributes && actual.attributes.preview"
            @input="upload('postImage', $event)"
            @remove="removeProperty('design')"
          />
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
import { ref, computed, watchEffect } from 'vue';
import qrcode from 'qrcode'; // https://github.com/soldair/node-qrcode

import useItem, * as rest from '../../../components/admin/useItem';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/spaces/store';
import accountsStore from '../../../../modules/accounts/store';

export default {
  ...rest,

  setup(props, context) {
    const qrPng = ref('');
    const qrSvg = ref('');

    const id = computed(() => props.id);

    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
    ]);

    const url = computed(() => !item.creating.value && `/app/manage/${id.value}`);
    const href = computed(() => url.value && `${document.location.origin}/#${url.value}`);

    watchEffect(async () => {
      qrPng.value = '';
      qrSvg.value = '';

      if (href.value) {
        const base64 = await qrcode.toDataURL(href.value, { width: 640, errorCorrectionLevel: 'medium', margin: 1 });
        qrPng.value = base64;
        const svg = await qrcode.toString(href.value, { type: 'svg', errorCorrectionLevel: 'medium', margin: 1 });
        qrSvg.value = `data:image/svg+xml;base64,${btoa(svg)}`;
      }
    });

    return {
      ...item,
      ...fetchers,

      emit: context.emit,

      qrPng,
      qrSvg,
      url,

      accounts: accountsStore.state.accounts,
    };
  },
};
</script>
