import { reactive, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

export default function useFilter({ store }) {
  const route = useRoute();

  const filter = reactive({
    accountIds: [],
    spaceIds: [],
    hubIds: [],
  });

  // Set initial values if there are any in the route query.
  watchEffect(() => {
    const query = route.query;
    Object.keys(filter).forEach((key) => {
      const value = query[key];
      if (value) {
        filter[key] = value.split(',');
      }
    });
  });

  return {
    filter,
    filtered: computed(() => store.getters.filtered.value(filter)),
  };
}
