import { ref, computed, watchEffect } from 'vue';

import AdminEmptyList from './AdminEmptyList.vue';
import AdminFilter from './AdminFilter.vue';
import AdjustableGrid from '../layout/AdjustableGrid.vue';
import Pane from '../layout/Pane.vue';
import authStore from '../../../modules/auth/store';

export const emits = ['close-pane', 'overrun'];
export const components = { AdminEmptyList, AdminFilter, AdjustableGrid, Pane };

export default function useItems({ store }, { emit }) {
  const show = ref(true);
  const selected = ref(null);

  // Close pane if it is not shown and doesn't have an open child.
  watchEffect(() => show.value || selected.value || emit('close-pane'));

  return {
    show,
    selected,

    canCreate: computed(() => authStore.getters.canCreate.value({ [store.name]: true })),

    relay: (event) => emit('overrun', event),

    toggleSelection: (id) => {
      selected.value = selected.value !== id ? id : null;
    },
  };
}
