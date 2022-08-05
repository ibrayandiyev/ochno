import { watchEffect } from 'vue';

import { showError } from '../utils/error';

export default function useFetch({ dispatch, params, trigger }) {
  async function fetch() {
    try {
      return dispatch(params?.());
    } catch (err) {
      showError(err);
      throw err; // Rethrow error to function caller.
      // TODO: This is rarely, if ever, shown to the user.
    }
  }

  watchEffect(() => {
    if (!trigger || trigger.value) {
      fetch();
    }
  });

  return { fetch };
}
