<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="home" />
    </template>

    <template #title>
      <span>Device type: {{ title }}</span>
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
            <label>Vendor id (vid)</label>
            <Field v-bind="generateProps('match.vid')" v-on="generateEvents('match.vid')">- - - -</Field>

            <label>Product id (pid)</label>
            <Field v-bind="generateProps('match.pid')" v-on="generateEvents('match.pid')">- - - -</Field>

            <label>Voltage</label>
            <Field v-bind="generateProps('match.voltage')" v-on="generateEvents('match.voltage')">-</Field>

            <label>Manufacturer name</label>
            <Field v-bind="generateProps('resolve.device.manufacturer')" v-on="generateEvents('resolve.device.manufacturer')" />

            <label>Product name</label>
            <Field v-bind="generateProps('resolve.device.product')" v-on="generateEvents('resolve.device.product')" />
          </div>

          <div v-if="creating" class="m-up text-center">
            <el-button :disabled="isSubmitting" @click="create">Create device type</el-button>
          </div>
        </div>

        <div v-if="!creating" class="flex flex-column">
          <h4 class="admin-header">Image</h4>

          <Upload
            :disabled="!canEdit || isSubmitting || isUploading"
            :uploading="isUploading"
            :image="$_.get(actual, 'resolve.device.image')"
            @input="upload('postImage', $event)"
            @remove="removeProperty('resolve.device.image')"
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
import { computed } from 'vue';

import useItem, * as rest from '../../../components/admin/useItem';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/devicetypes/store';


export default {
  ...rest,

  setup(props, context) {
    const id = computed(() => props.id);

    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
    ]);

    return {
      ...item,
      ...fetchers,

      emit: context.emit,
    };
  },
};
</script>
