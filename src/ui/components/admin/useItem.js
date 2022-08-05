import _ from 'lodash';
import { ref, computed, watchEffect } from 'vue';

import JSONEditor from '../JSONEditor.vue';
import Upload from '../Upload.vue';
import Pane from '../layout/Pane.vue';
import useSave from '../../composables/useSave';
import { showError } from '../../utils/error';
import authStore from '../../../modules/auth/store';

export const emits = ['close-pane', 'created'];
export const components = { JSONEditor, Pane, Upload };
export const props = { id: { type: String } };

export default function useItem({ id, store, validation = store.validation }, { emit }) {
  const creating = computed(() => id.value === 'creating');
  const actual = ref({});

  watchEffect(() => {
    actual.value = creating.value ? {} : store.getters.full.value(id.value);
  });

  const save = useSave({ actual, store, validation });

  const canEdit = computed(() => authStore.getters.canUpdate.value(store.name, save.item));
  const canRemove = computed(() => authStore.getters.canDelete.value(store.name, save.item));

  return {
    creating,
    actual,

    ...save,

    canEdit,
    canRemove,

    title: computed(() => (creating.value ? `New ${store.name.replace(/([a-z])([A-Z]+)/g, '$1 $2').toLowerCase()}` : store.getters.title.value(id.value))),

    generateProps(path) {
      return {
        modelValue: _.get(save.item, path),
        disabled: !canEdit.value || save.isSubmitting.value,
        icon: (save.isSubmitting.value && save.hasChange.value(path)) ? 'loading' : undefined,
        message: _.get(save.errors, path),
        autoComplete: 'off',
      };
    },

    generateEvents(path) {
      return {
        'input:modelValue': (val) => _.set(save.item, path, val),
        'update:modelValue': (val) => {
          _.set(save.item, path, val);
          if (!creating.value) {
            save.saveProperty(path);
          }
        },
      };
    },

    async create() {
      try {
        const item = await save.saveItem();
        if (item) {
          emit('created', item.id);
        }
      } catch (error) {
        showError(error);
      }
    },

    async remove() {
      try {
        await save.removeItem();
        emit('close-pane');
      } catch (error) {
        showError(error);
      }
    },

    async saveFull(data) {
      try {
        await save.saveItem(data);
      } catch (error) {
        showError(error);
      }
    },
  };
}
