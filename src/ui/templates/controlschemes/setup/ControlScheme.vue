<template>
  <div class="control-scheme absolute-cover fill-height bg-gray-1">
    <Scrollbar>
      <div class="fill-height flex flex-column">
        <el-button class="back-arrow absolute -square -common-height -borderless" @click="back">
          <div v-if="isChanged" class="badge" />
          <Icon type="arrow" />
        </el-button>

        <div class="header-info grid p-block bg-gray-2">
          <h3>{{ $t('Control scheme') }}</h3>
          <div class="info">
            {{ $t('A control scheme enables customization of the controls the user interacts with. You can apply this control scheme to any space and changes to it will apply to any panel using it.') }}
          </div>
        </div>

        <div class="data-wrapper">
          <div class="info-wrapper p-block m-down">
            <div class="control-grid">
              <div class="-circle"><Icon type="info" /></div>
              <div class="label">{{ $t('Name') }}</div>
              <Field v-model="item.name" />
            </div>
          </div>

          <div>
            <h4 class="grid-header text-center">{{ $t('Controls shown in panel') }}</h4>

            <el-collapse v-if="item.controls && item.controls.length" v-model="expanded">
              <draggable
                :list="item.controls"
                :item-key="(element) => item.controls.findIndex((control) => control === element)"
                group="controls"
                handle=".drag-handle"
                @start="dragStart"
                @end="dragEnd"
              >
                <template #item="{ element, index }">
                  <component :is="customizePart(element).component" :name="index" :control="element" />
                </template>
              </draggable>
            </el-collapse>

            <Field
              v-if="!moving"
              type="select"
              icon="add"
              class="part-action"
              :model-value="selector"
              @input:model-value="addControl"
            >
              <template #options>
                <el-option v-for="(control, index) in filteredControls" :key="index" :value="control">
                  <Icon :type="customizePart(control).icon" class="m-end" />
                  {{ customizePart(control).name }}
                </el-option>
              </template>
              {{ $t('Add control') }}
            </Field>
            <div v-else class="remove-dropzone relative">
              <draggable :list="[]" item-key="removal" group="controls" class="absolute-cover">
                <template #item="" />
              </draggable>
              <div class="part-action flex-space-between">
                <div class="bold">{{ $t('Remove control') }}</div>
                <Icon type="bin" />
              </div>
            </div>
          </div>

          <div class="info-wrapper p-block">
            <el-tooltip placement="top" :content="$t('By setting a guest user you can allow anyone to access the controls.')">
              <h4 class="grid-header text-center">{{ $t('Guest sign in as') }}</h4>
            </el-tooltip>

            <div class="control-grid">
              <div class="-circle"><Icon type="mail" /></div>
              <div class="label">{{ $t('Email') }}</div>
              <Field type="select" :model-value="item.user && item.user.email" @input:model-value="setUser('email', $event)">
                <template #options>
                  <el-option v-for="user in users" :key="user.id" :label="user.email" :value="user.email" />
                  <el-option v-if="item.user && item.user.email" :value="null">
                    <span class="bold">{{ $t('Disable guest user') }}</span>
                  </el-option>
                </template>
                {{ $t('Select user') }}
              </Field>

              <div class="-circle"><Icon type="usersRoles" /></div>
              <div class="label">{{ $t('Password') }}</div>
              <Field :model-value="item.user && item.user.password" @update:model-value="setUser('password', $event)" />
            </div>
          </div>

          <div class="actions-grid grid p-block-s">
            <div /><!-- To make the save buttons centered -->

            <el-button :disabled="!isChanged && !isNew" @click="save">{{ $t('Save changes') }}</el-button>

            <el-tooltip placement="top" :content="$t('Revert changes')">
              <el-button :disabled="!isChanged" class="-square -borderless" @click="revert"><Icon type="undo" /></el-button>
            </el-tooltip>

            <el-tooltip placement="top" :content="$t('Delete control scheme')">
              <el-button :disabled="isNew" class="-square -borderless" @click="remove"><Icon type="bin" /></el-button>
            </el-tooltip>
          </div>
        </div>

        <DashedLine />

        <div v-if="item.id" class="grid text-center p-block bg-gray-2" style="justify-content: center">
          <a :href="url" target="_blank">
            <el-button>{{ $t('View control panel') }}</el-button>
          </a>
          <a :href="qrSvg" :download="`${spaceTitle(spaceId)} control panel qrcode.svg`">
            <el-button>{{ $t('Download QR code') }}</el-button>
          </a>
        </div>
      </div>
    </Scrollbar>
  </div>
</template>


<script>
// TODO: Fix so that a warning message is shown if the user clicks the menu click-trap.
import { ElMessageBox } from 'element-plus';
import i18next from 'i18next';
import _ from 'lodash';
import qrcode from 'qrcode';
import { ref, computed, watch, watchEffect, nextTick } from 'vue';
import draggable from 'vuedraggable';

import customizePart from './customizePart';
import components from './parts';
import DashedLine from '../../../components/DashedLine.vue';
import useSave from '../../../composables/useSave';
import controlSchemesStore from '../../../../modules/controlschemes/store';
import spacesStore from '../../../../modules/spaces/store';

const limitedControls = [
  { deviceType: 'lamp' },
  { deviceType: 'fan' },
  { deviceType: 'button' },
  { component: 'ControlMechanisms' },
  { deviceType: 'sensor' },
];

const unlimitedControls = [
  { component: 'CustomImage' },
  { component: 'CustomHTML' },
];

export default {
  components: { draggable, ...components, DashedLine },

  props: {
    controlSchemeId: { type: String },
    setupControlScheme: { type: Object },
    spaceId: { type: String, required: true },
    users: { type: Array, default: () => [] },
  },

  emits: ['back'],

  setup(props, { emit }) {
    const selector = ref(null);
    const moving = ref(false);
    const qrSvg = ref('');
    const id = ref(props.controlSchemeId);

    const controlScheme = computed(() => controlSchemesStore.state.controlSchemes[id.value] || props.setupControlScheme);

    const save = useSave({ actual: controlScheme, store: controlSchemesStore });

    const isNew = computed(() => !controlScheme.value?.id);

    const url = computed(() => `${window.location.origin}/#/app/controlpanel?space=${props.spaceId}&controlScheme=${id.value}`);

    watchEffect(async () => {
      qrcode.toString(url.value, { type: 'svg', errorCorrectionLevel: 'medium', margin: 1 }).then((svg) => {
        qrSvg.value = `data:image/svg+xml;base64,${btoa(svg)}`;
      });
    });

    watch(
      // Sometimes dragend does not trigger and this is just a backup to that.
      () => save.item?.controls,
      () => {
        moving.value = false;
      },
    );

    return {
      emit,

      selector,
      moving,
      qrSvg,
      id,
      expanded: ref([]),

      ...save,
      isNew,
      url,
      spaceTitle: spacesStore.getters.title,

      filteredControls: computed(() => {
        if (save.item) {
          let filteredControls = limitedControls;
          if (save.item.controls) {
            filteredControls = filteredControls.filter((control) => !save.item.controls.find((ctrl) => _.isMatch(ctrl, control)));
          }
          return filteredControls.concat(unlimitedControls);
        }
        return [];
      }),

      customizePart,

      dragStart: () => {
        moving.value = true;
      },

      dragEnd: () => {
        nextTick(() => {
          moving.value = false;
        });
      },

      addControl: (value) => {
        if (value) {
          if (!save.item.controls) {
            save.item.controls = [];
          }
          save.item.controls.push(_.cloneDeep(value));
        }

        // To make the selector value go back to "empty".
        selector.value = 0;
        nextTick(() => {
          selector.value = null;
        });
      },

      setUser(path, value) {
        if (value !== undefined) {
          if (!save.item.user) {
            save.item.user = {};
          }
          if (value !== null) {
            save.item.user[path] = value;
          } else {
            save.item.user = value;
          }
        }
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
          if (await save.removeItem({ title: 'Delete control scheme' })) {
            emit('back', id.value); // The parent should react to the removal, but this back is for other situations.
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
.data-wrapper {
  max-width: 35rem;
  margin: auto;
}

.control-scheme:deep(.info-wrapper) {
  padding-left: 10%;
  padding-right: 10%;
}

.control-scheme:deep(.el-collapse-item__header) {
  .drag-handle {
    width: calc(var(--common-size) * 0.75);
    height: var(--common-size);
    margin-left: calc(var(--common-size) * -0.5);
    color: rgba(var(--color-nature), var(--opacity-medium));
    cursor: move;
    pointer-events: auto;

    &:hover {
      color: rgba(var(--color-nature), var(--opacity-heavy));
    }
  }

  .title-header {
    color: rgb(var(--color-gray-5));

    + .title-header {
      margin-left: 0.5em;
      opacity: 0.75;
    }
  }

  &.is-active,
  &:hover {
    .title-header {
      color: inherit;
    }
  }
}

.control-scheme:deep(.no-component) {
  .el-collapse-item__header {
    pointer-events: none;

    &:after {
      display: none;
    }
  }
}

.grid-header {
  margin-bottom: 1.5em;
}

.part-action {
  height: var(--common-size);
  max-width: 12em;
  margin: 0 auto;
  opacity: 0.7;
  border-color: transparent;
  background: transparent !important;
}

.remove-dropzone {
  &:hover {
    color: rgb(var(--color-nature));

    .part-action {
      opacity: 1;
    }
  }

  .absolute-cover {
    opacity: 0;
  }

  .part-action {
    box-sizing: border-box;
    padding-right: 1rem;
  }
}

.actions-grid {
  grid-template-columns: minmax(0, calc((var(--field-size) * 2) + 1rem)) 1fr auto auto;
  justify-items: center;
  margin: calc(var(--row-gap) * 1.5) auto;
}
</style>
