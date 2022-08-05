<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="toolbox" />
    </template>

    <template #title>
      <span>Mechanism Control: {{ title }}</span>
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
            <label>Mechanism control name</label>
            <Field v-bind="generateProps('name')" v-on="generateEvents('name')" />

            <label>Mechanism control icon</label>
            <Field v-bind="generateProps('icon')" v-on="generateEvents('icon')" />

            <label>Space</label>
            <Field type="select" filterable v-bind="generateProps('spaceId')" v-on="generateEvents('spaceId')">
              <template #options>
                <el-option v-for="space in spaces" :key="space.id" :label="spaceTitle(space.id)" :value="space.id" />
              </template>
            </Field>

            <label>Mechanisms</label>
            <Field type="select" multiple filterable v-bind="generateProps('mechanismIds')" v-on="generateEvents('mechanismIds')">
              <template #options>
                <el-option v-for="mechanism in mechanisms" :key="mechanism.id" :label="mechanismTitle(mechanism.id)" :value="mechanism.id" />
              </template>
            </Field>
          </div>

          <div v-if="creating" class="m-up text-center">
            <el-button :disabled="isSubmitting" @click="create">Create mechanism control</el-button>
          </div>
        </div>

        <div v-if="!creating" />
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
import store from '../../../../modules/mechanismcontrols/store';
import mechanismsStore from '../../../../modules/mechanisms/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  ...rest,

  setup(props, context) {
    const id = computed(() => props.id);

    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
      { store: mechanismsStore },
      { store: spacesStore },
    ]);

    return {
      ...item,
      ...fetchers,

      emit: context.emit,

      spaces: spacesStore.state.spaces,
      spaceTitle: spacesStore.getters.title,
      mechanisms: computed(() => Object.values(mechanismsStore.state.mechanisms).filter((mech) => (mech.spaceId === item.item?.spaceId || item.actual.value?.mechanismIds?.indexOf(mech.id) >= 0))),
      mechanismTitle: mechanismsStore.getters.title,
    };
  },
};
</script>
