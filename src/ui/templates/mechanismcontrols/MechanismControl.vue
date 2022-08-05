<template>
  <div class="mechanism-control absolute-cover bg-gray-2">
    <Scrollbar>
      <el-button class="back-arrow absolute -square -common-height -borderless" @click="back">
        <div v-if="isChanged" class="badge" />
        <Icon type="arrow" />
      </el-button>

      <div class="header-info grid p-block bg-gray-2">
        <h3>{{ $t('Mechanism control') }}</h3>
        <div class="info">
          {{ $t('A mechanism control makes it possible for the user to interact with your mechanisms.') }}
        </div>
      </div>

      <div class="mechanism-wrapper control-width">
        <div class="info-wrapper m-down">
          <h4 class="grid-header text-center">{{ $t('Where to show controls') }}</h4>

          <div class="control-grid">
            <div class="-circle"><Icon type="toolbox" /></div>
            <div class="label">{{ $t('Mechanisms') }}</div>
            <Field type="select" multiple :model-value="item.mechanismIds" @input:model-value="setMechanisms">
              <template #options>
                <el-option v-for="mech in mechanisms" :key="mech.id" :label="mechanismTitle(mech)" :value="mech.id" />
              </template>
              {{ $t('Select mechanisms') }}
            </Field>
          </div>
        </div>

        <div class="info-wrapper m-down">
          <h4 class="grid-header text-center">{{ $t('Controls shown to user') }}</h4>

          <div class="control-grid">
            <div class="-circle"><Icon type="info" /></div>
            <div class="label">{{ $t('Name') }}</div>
            <Field v-model="item.name" type="text" />

            <div class="-circle"><Icon type="info" /></div>
            <div class="label">{{ $t('Icon') }}</div>
            <Field v-model="item.icon" type="select">
              <template #options>
                <el-option v-for="icon in icons" :key="icon.value" :label="icon.label" :value="icon.value">
                  <Icon :type="icon.value" style="margin-right: 1rem" />
                  <span>{{ icon.label }}</span>
                </el-option>
              </template>
              {{ $t('Select icon') }}
            </Field>
          </div>
        </div>

        <el-collapse v-if="item.controls && item.controls.length" v-model="expanded">
          <draggable
            :list="item.controls[0].buttons"
            :item-key="(element) => item.controls[0].buttons.findIndex((part) => part === element)"
            group="mechanismControls"
            handle=".drag-handle"
            @start="moving = true"
            @end="moving = false"
          >
            <template #item="{ element, index }">
              <el-collapse-item :name="index">
                <template #title>
                  <div class="drag-handle" />
                  <h3 class="title-header">{{ $t('Button') }}</h3>
                  <span class="title-header" style="text-transform: none">{{ element.text }}</span>
                </template>

                <div class="button-control">
                  <div class="control-grid">
                    <div class="-circle"><Icon type="info" /></div>
                    <div class="label">{{ $t('Button text') }}</div>
                    <Field v-model="element.text" type="text" />
                  </div>

                  <div v-if="!element.payload || !Object.keys(element.payload).length" class="control-grid-key-value control-grid">
                    <div class="label">{{ $t('Key') }}</div>
                    <Field type="text" @update:model-value="setKey(element, '', $event)" />
                    <div class="label">{{ $t('Value') }}</div>
                    <Field type="text" @update:model-value="setValue(element, '', $event)" />
                  </div>

                  <div v-for="(value, key) in element.payload" :key="key" class="control-grid-key-value control-grid">
                    <div class="label">{{ $t('Key') }}</div>
                    <Field type="text" :model-value="key" @update:model-value="setKey(element, key, $event)" />
                    <div class="label">{{ $t('Value') }}</div>
                    <Field type="text" :model-value="value" @update:model-value="setValue(element, key, $event)" />
                  </div>
                </div>
              </el-collapse-item>
            </template>
          </draggable>
        </el-collapse>

        <div v-if="!moving" class="text-center">
          <el-button class="part-action -quadratic -borderless" @click="addButton">
            <div class="auto-fr-grid">
              <Icon type="add" />
              <span class="bold" style="text-transform: none">{{ $t('Add button') }}</span>
            </div>
          </el-button>
        </div>
        <div v-else class="remove-dropzone relative">
          <draggable :list="[]" item-key="removal" group="mechanismControls" class="absolute-cover">
            <template #item="" />
          </draggable>
          <div class="part-action flex" style="justify-content: center;">
            <div class="auto-fr-grid">
              <Icon type="bin" />
              <div class="bold">{{ $t('Remove button') }}</div>
            </div>
          </div>
        </div>

        <div class="actions-grid grid control-width p-block-s">
          <div /><!-- To make the save button centered -->

          <el-button :disabled="!isChanged && !isNew" @click="save">{{ $t('Save changes') }}</el-button>

          <el-tooltip placement="top" :content="$t('Revert changes')">
            <el-button :disabled="!isChanged" class="-square -borderless" @click="revert"><Icon type="undo" /></el-button>
          </el-tooltip>

          <el-tooltip placement="top" :content="$t('Delete')">
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
import draggable from 'vuedraggable';
import { ref, computed } from 'vue';

import useSave from '../../composables/useSave';
import mechanismControlsStore from '../../../modules/mechanismcontrols/store';
import mechanismsStore from '../../../modules/mechanisms/store';

const icons = [
  { value: 'deviceButton', label: i18next.t('button') },
  { value: 'deviceLamp', label: i18next.t('lamp') },
  { value: 'deviceFan', label: i18next.t('fan') },
];

export default {
  components: { draggable },

  props: {
    mechanismControlId: { type: String },
    setupMechanismControl: { type: Object },
  },

  emits: ['back'],

  setup(props, { emit }) {
    const moving = ref(false);
    const expanded = ref([]);
    const id = ref(props.mechanismControlId);

    const mechanismControl = computed(() => mechanismControlsStore.state.mechanismControls[id.value] || props.setupMechanismControl);

    const save = useSave({ actual: mechanismControl, store: mechanismControlsStore });

    const isNew = computed(() => !mechanismControl.value?.id);

    const setupPayload = (button) => {
      if (!button.payload) {
        button.payload = {}; // eslint-disable-line no-param-reassign
      }
      return button.payload;
    };

    return {
      icons,

      emit,

      moving,
      expanded,

      ...save,
      isNew,

      mechanisms: mechanismsStore.state.mechanisms,
      mechanismTitle: mechanismsStore.getters.title,

      addButton() {
        if (!save.item.controls) {
          save.item.controls = [];
        }

        const { controls } = save.item;
        if (!controls.length) {
          controls.push({ type: 'buttons', buttons: [] });
        }

        controls[0].buttons.push({ payload: {} });
      },

      setMechanisms(ids) {
        save.item.mechanismIds = ids;
      },

      setKey(button, key, value) {
        const payload = setupPayload(button);
        payload[value] = payload[key] || '';
        delete payload[key];
      },

      setValue(button, key, value) {
        const payload = setupPayload(button);
        const number = Number.parseFloat(value);
        payload[key] = Number.isNaN(number) ? value : number;
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
.button-control {
  padding: var(--row-gap) 10%;
  background: rgba(var(--color-gray-3), var(--opacity-light));
}

.grid-header {
  margin-bottom: 1.5em;
}
</style>
