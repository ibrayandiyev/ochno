import { ElMessageBox } from 'element-plus';
import i18next from 'i18next';
import _ from 'lodash';
import { ref, reactive, computed, watch, toRaw } from 'vue';

import useValidate from './useValidate';
import clearObject from '../utils/clearObject';

export default function useSave({ actual, store, validation = store.validation }) {
  const item = reactive({});
  const isSubmitting = ref(false);
  const isUploading = ref(false);

  const revert = () => {
    clearObject(item);
    return Object.assign(item, _.cloneDeep(toRaw(actual.value)));
  };

  watch(() => actual.value, revert, { immediate: true }); // This needs to be done here to setup item.

  const { errors, hasError, validate } = useValidate({ data: item, schema: validation });

  const isChanged = computed(() => !_.isEqual(actual.value, item));
  const hasChange = computed(() => (path) => !_.isEqual(_.get(actual.value, path), _.get(item, path)));

  const confirmation = ({ text = 'This will be permanently removed. Are you sure?', title = 'Removing' } = {}) => ElMessageBox.confirm(i18next.t(text), i18next.t(title), {
    cancelButtonText: i18next.t('No'),
    confirmButtonText: i18next.t('Yes'),
  });

  // Using send directly does not use validation.
  // Either validate manually, or use submit function.
  const send = async (action, payload) => {
    if (!action) {
      throw new Error('No submit action.');
    }
    if (!payload) {
      throw new Error('No data to submit.');
    }
    if (action !== 'post' && !payload.id) {
      throw new Error('No id to submit data to.', payload);
    }

    isSubmitting.value = true;
    try {
      const value = await _.get(store.dispatch, action)(payload);
      isSubmitting.value = false;
      return value;
    } catch (err) {
      isSubmitting.value = false;
      throw err;
    }
  };

  const submit = async (...args) => {
    if (await validate()) {
      return send(...args);
    }
    return null;
  };

  // Save the full item.
  const saveItem = async (value, force) => {
    if (value) {
      Object.assign(item, value);
    }

    if (isChanged.value || force) {
      if (actual?.value?.id) {
        return submit('put', { id: actual.value.id, data: item });
      }
      return submit('post', item);
    }

    return false; // No need to update since the item hasn't changed.
  };

  // Save only a single property of an item (uses actual values for the rest).
  const saveProperty = async (path) => {
    const value = _.get(item, path);
    const actualValue = actual?.value;
    const actualProp = actualValue && _.get(actualValue, path);

    if (!_.get(errors, path) && actualValue && value !== actualProp) {
      const data = _.cloneDeep(actualValue);
      _.set(data, path, value);
      return send('put', { id: actualValue.id, data });
    }

    return false; // There is no change or an error, don't save.
  };

  // Upload a file using a specific action.
  const upload = async (action, fileDetails) => {
    isUploading.value = true;
    try {
      const value = await send(action, { id: item.id, data: fileDetails });
      Object.assign(item, value); // Need to set this since the upload doesn't know what to set itself.
      isUploading.value = false;
      return value;
    } catch (error) {
      isUploading.value = false;
      throw error;
    }
  };

  // Delete an item completely. Will show a confirmation dialog.
  const removeItem = async (dialog) => {
    if (!actual?.value?.id) {
      return false;
    }

    try {
      await confirmation(dialog);
    } catch (err) {
      return false; // Using an catch function to capture 'cancel' message.
    }

    return send('delete', { id: item.id });
  };

  // Delete a specific property of an item (set to null). Will show a confirmation dialog.
  const removeProperty = async (path, dialog) => {
    if (!actual?.value?.id) {
      return false;
    }

    try {
      await confirmation(dialog);
    } catch (err) {
      return false; // Using an catch function to capture 'cancel' message.
    }

    _.set(item, path, null);
    return saveProperty(path);
  };

  return {
    item,
    errors,
    hasError,
    isSubmitting,
    isUploading,

    isChanged,
    hasChange,

    send,
    submit,
    saveItem,
    saveProperty,
    upload,
    removeItem,
    removeProperty,
    revert,
    confirmation,
  };
}
