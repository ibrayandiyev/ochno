import { ref } from 'vue';

import { buildErrorMessage } from '../utils/error';

export default function useSubmitter() {
  const isSubmitting = ref(false);
  const submitError = ref('');

  return {
    isSubmitting,
    submitError,

    submit: async (func) => {
      isSubmitting.value = true;
      submitError.value = '';

      try {
        const retval = await func;
        isSubmitting.value = false;
        return retval;
      } catch (error) {
        isSubmitting.value = false;
        submitError.value = buildErrorMessage(error);
        throw error;
      }
    },
  };
}
