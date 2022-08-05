import { computed } from 'vue';

import useFetch from './useFetch';

export default function useFetchers(collections) {
  const fetchers = collections.map(({ store, action = 'get', params, trigger }) => ({
    ...useFetch({ dispatch: store.dispatch[action], params, trigger }), // fetch

    fetching: store.state.fetching,
  }));

  return {
    fetching: computed(() => !!fetchers.find(({ fetching }) => fetching.value)),

    fetchAll: () => fetchers.forEach(({ fetch }) => fetch()),
  };
}
