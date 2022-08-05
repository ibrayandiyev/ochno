import { reactive, computed, watch } from 'vue';

import clearObject from '../utils/clearObject';

export default function useValidate({ data, schema, options = {} }) {
  const { abortEarly = false, immediate = false } = options;

  const errors = reactive({});

  async function validateAt(path) {
    try {
      delete errors[path];
      await schema.validateAt(path, data);
    } catch (err) {
      errors[path] = err.message;
    }
  }

  async function validate(val = data) {
    try {
      const validated = await schema.validate(val, { abortEarly });
      clearObject(errors);
      return validated;
    } catch (err) {
      err.inner.forEach(({ path, message }) => {
        errors[path] = message;
      });
      return null;
    }
  }

  Object.keys(schema.fields).forEach((key) => {
    watch(
      () => data[key],
      () => validateAt(key),
      { immediate },
    );
  });

  return {
    errors,

    hasError: computed(() => Object.values(errors).length > 0),

    validate,
  };
}
