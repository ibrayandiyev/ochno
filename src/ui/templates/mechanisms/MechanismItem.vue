<template>
  <div class="mechanism-item absolute-cover bg-gray-2">
    <Scrollbar>
      <el-button class="back-arrow absolute -square -common-height -borderless" @click="back">
        <div v-if="isChanged" class="badge" />
        <Icon type="arrow" />
      </el-button>

      <div class="header-info grid p-block bg-gray-2">
        <h3>{{ $t('Mechanism') }}</h3>
        <div class="info">
          {{ $t('A mechanism allows you to automate the behavior of your devices.') }}
        </div>
      </div>

      <div class="mechanism-wrapper control-width">
        <div class="info-wrapper">
          <div class="control-grid">
            <div class="-circle"><Icon type="info" /></div>
            <div class="label">{{ $t('Name') }}</div>
            <Field v-model="item.name" />

            <div class="-circle"><Icon type="power" /></div>
            <div class="label">{{ $t('Enabled') }}</div>
            <el-switch :value="!item.disabled" style="justify-self: flex-end" @input="setEnabled" />
          </div>
        </div>

        <MechanismParts :parts="item.parts" @dragging="moving = $event" />

        <Field
          v-if="!moving"
          type="select"
          icon="add"
          class="part-action add-select"
          :model-value="selector"
          @input:model-value="addPart"
        >
          <template #options>
            <el-option-group v-for="(group, index) in partGroups" :key="index" :label="group.label">
              <el-option v-for="part in group.parts" :key="part.label" :label="part.label" :value="part" />
            </el-option-group>
          </template>
          {{ $t('Add part') }}
        </Field>
        <div v-else class="remove-dropzone relative">
          <draggable :list="[]" item-key="removal" group="mechanisms" class="absolute-cover">
            <template #item="" />
          </draggable>
          <div class="part-action flex-space-between">
            <div class="bold">{{ $t('Remove part') }}</div>
            <Icon type="bin" />
          </div>
        </div>

        <div class="actions-grid grid p-block-s">
          <div /><!-- To make the save button centered -->

          <el-button :disabled="!isChanged && !isNew" @click="save">{{ $t('Save changes') }}</el-button>

          <el-tooltip placement="top" :content="$t('Revert changes')">
            <el-button :disabled="!isChanged" class="-square -borderless" @click="revert"><Icon type="undo" /></el-button>
          </el-tooltip>

          <el-tooltip placement="top" :content="$t('Delete mechanism')">
            <el-button :disabled="isNew" class="-square -borderless" @click="remove"><Icon type="bin" /></el-button>
          </el-tooltip>
        </div>
      </div>
    </Scrollbar>
  </div>
</template>


<script>
import { ElMessageBox } from 'element-plus';
import i18next from 'i18next';
import _ from 'lodash';
import draggable from 'vuedraggable';
import { ref, computed, watch, watchEffect, onUnmounted, nextTick } from 'vue';

import MechanismParts from './MechanismParts.vue';
import { partGroups } from './parts';
import useSave from '../../composables/useSave';
import mechanismsStore from '../../../modules/mechanisms/store';
import workspaceStore from '../../../modules/workspace/store';

const regexIds = /"ids":(\[.*?\])/g;

function recursiveFindType(parts, type) {
  if (Array.isArray(parts)) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const item = parts[i];
      if (Array.isArray(item)) {
        const found = recursiveFindType(item, type);
        if (found) {
          return found;
        }
      } else if (item.type === type) {
        return item;
      }
    }
  }

  return null;
}

export default {
  components: { draggable, MechanismParts },

  props: {
    mechanismId: { type: String },
    setupMechanism: { type: Object },
    setupPortIds: { type: Array, default: () => [] },
  },

  emits: ['back'],

  setup(props, { emit }) {
    let highlightTimeout = null;
    const selector = ref(null);
    const moving = ref(false);
    const id = ref(props.mechanismId);

    // return this.mechanismId || this.temp.id;
    const mechanism = computed(() => mechanismsStore.state.mechanisms[id.value] || props.setupMechanism);

    const save = useSave({ actual: mechanism, store: mechanismsStore });

    const isNew = computed(() => !mechanism.value?.id);
    const portIds = computed(() => {
      // NOTE This is probably not an especially efficient way of getting the ports. But it works :D
      const parts = save.item?.parts;
      if (parts) {
        const matches = [...JSON.stringify(parts).matchAll(regexIds)];
        if (matches.length) {
          return _.uniq(matches.map(([, match]) => JSON.parse(match)).flat().filter((val) => val));
        }
      }
      return [];
    });

    watch(
      () => portIds.value,
      () => {
        clearTimeout(highlightTimeout);
        highlightTimeout = setTimeout(() => workspaceStore.dispatch.set({
          highlighting: {
            mechanismId: id.value,
            itemIds: portIds.value,
          },
        })); // No timeout, using this setup to keep highlighting from triggering multiple times.
      },
      { immediate: true },
    );

    watchEffect(() => {
      id.value = props.mechanismId;
    });

    onUnmounted(() => workspaceStore.dispatch.clear(['editing', 'highlighting']));

    return {
      partGroups,

      emit,

      selector,
      moving,

      ...save,
      isNew,

      setEnabled(value) {
        save.item.disabled = !value;
      },

      addPart({ type, setup, addLast }) {
        if (!save.item.parts) {
          save.item.parts = [];
        }

        const { parts } = save.item;
        let container = parts;

        if (addLast) {
          container.push(setup({ ids: props.setupPortIds, parts, container }));
        } else {
          // If the current last item is a container, the user probably wants to add the part in it, so lets make that happen.
          while (Array.isArray(container[container.length - 1])) {
            container = container[container.length - 1];
          }

          const previous = recursiveFindType(container, type) || recursiveFindType(parts, type);
          container.push(setup({ ids: props.setupPortIds, parts, container, previous }));
        }

        // To make the selector value go back to "empty".
        selector.value = 0;
        nextTick(() => {
          selector.value = null;
        });
      },

      async save() {
        try {
          const saved = await save.saveItem(null, isNew.value);
          id.value = saved.id;
        } catch (error) {
          console.warn(error); // TODO: Error handling.
        }
      },

      async remove() {
        try {
          if (await save.removeItem({ title: 'Delete mechanism' })) {
            emit('back', id.value); // The MechanismList should react to the removal, but this back is for other situations.
          }
        } catch (error) {
          console.warn(error); // TODO: Error handling.
        }
      },

      async back() {
        if (save.isChanged.value) {
          try {
            await ElMessageBox.confirm(i18next.t('You have unsaved changes. Closing will discard your changes. Are you sure?'), i18next.t('Unsaved changes'), {
              confirmButtonText: i18next.t('Cancel'),
              cancelButtonText: i18next.t('Discard'),
            });
            return; // confirm / resolved
          } catch (error) {
            // The user chose to discard the changes. Emitting the back signal below.
          }
        }

        emit('back', id.value);
      },
    };
  },
};
</script>


<style scoped lang="less">
.part-action {
  max-width: 12em;
}
</style>
