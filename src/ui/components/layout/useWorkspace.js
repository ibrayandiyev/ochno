import _ from 'lodash';
import { computed, unref, watch, watchEffect, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import emitter from '../../utils/emitter';
import workspaceStore, { TOOLS } from '../../../modules/workspace/store';

export default ({ panes, shouldOpenSelectionPane = true }) => {
  const route = useRoute();

  let oldSelectionLength = 0; // Need this because the selection watcher does not give us an old value.

  const id = computed(() => route.params.spaceId);

  const selectionPane = computed(() => panes && Object.values(panes).find(({ selection }) => selection));
  const permanentPane = computed(() => panes && Object.values(panes).find(({ permanent }) => permanent));

  const openPane = (pane, auto) => { // Mutates pane!
    /* eslint-disable no-param-reassign */
    pane.open = true;
    pane.hidden = false;
    pane.time = (auto && (pane.open || pane.hidden)) ? pane.time : Date.now(); // If the pane is opened automatically, use the previous time, if there is one.
    /* eslint-enable no-param-reassign */
  };

  const closePane = (pane) => { // Mutates pane!
    /* eslint-disable no-param-reassign */
    pane.open = false;
    pane.hidden = false;
    /* eslint-enable no-param-reassign */

    const openPanes = Object.values(panes).filter(({ open, hidden }) => open && !hidden).filter((p) => p !== permanentPane.value);

    if (pane && pane.selection) {
      const length = _.get(workspaceStore.state.selection, 'itemIds.length', 0);
      if (length === 1 && !openPanes.length) {
        workspaceStore.dispatch.clear(['selection']);
      }
    }

    // If there are no other open panes, close all hidden panes, otherwise it's easy to get confused.
    if (!openPanes.length) {
      Object.values(panes)
        .filter(({ hidden }) => hidden)
        .filter((p) => p !== permanentPane.value)
        .forEach((hiddenPane) => closePane(hiddenPane));

      if (permanentPane.value && !permanentPane.value.open) {
        openPane(permanentPane.value, true);
      }
    }
  };

  const closeLatest = () => {
    const vals = _.chain(panes)
      .filter({ open: true })
      .filter((pane) => !pane.permanent)
      .values()
      .sortBy('time')
      .value(); // Retrieve the final value.
    if (vals.length) {
      closePane(vals.pop());
    }
  };

  const togglePane = (pane) => (!pane.open || pane.hidden ? openPane(pane) : closePane(pane));

  const overrun = () => {
    let currentPanes = Object.values(panes).filter(({ open, hidden }) => open && !hidden);

    if (currentPanes.length > 2) {
      currentPanes = currentPanes.filter((pane) => pane !== permanentPane.value);
    }

    if (currentPanes.length > 1) {
      nextTick(() => { // Next tick is necessary to trigger the adjustable grid to rerender.
        const orderedPanes = _.sortBy(currentPanes, 'time');
        orderedPanes[0].open = false;
        orderedPanes[0].hidden = true;
      });
    }
  };

  const escapeKey = (ev) => (ev.code === 'Escape' && closeLatest());

  watchEffect(() => {
    // Update workspace in case user arrived at url directly.
    if (workspaceStore.state.spaceId !== id.value) {
      workspaceStore.dispatch.set({ spaceId: id.value });
    }
  });

  watch(
    () => route.query.pane,
    () => {
      if (panes) {
        _.castArray(route.query.pane)
          .filter((name) => panes[name] && !(panes[name].open || panes[name].hidden))
          .forEach((name) => openPane(panes[name], true));
      }
    },
    { immediate: true },
  );

  watch(
    () => workspaceStore.state.selection,
    (newValue) => {
      if (unref(shouldOpenSelectionPane) && workspaceStore.state.tool !== TOOLS.multi) {
        // Open and close panes based on selection.
        const length = _.get(newValue, 'itemIds.length', 0);
        if (length === 0) {
          closePane(selectionPane.value);
        }
        if (!oldSelectionLength) {
          if (length) {
            openPane(selectionPane.value);
          } else {
            closePane(selectionPane.value);
          }
        }
        oldSelectionLength = length;
      }
    },
    { deep: true },
  );

  // Global event listener for key down, necessary to always react on key down even if element is not in focus.
  // Using key down instead of up because if the browser search bar is opened and in focus. Pressing escape closes it and a pane, but should only close search.
  window.addEventListener('keydown', escapeKey);

  // Listen to general message bus.
  emitter.$on('set-pane', (name) => {
    const pane = panes[name];
    if (pane === undefined) {
      console.warn(`Cannot open unknown pane: ${name}`); // eslint-disable-line no-console
    } else {
      openPane(pane);
    }
  });

  onUnmounted(() => {
    window.addEventListener('keydown', escapeKey);
    emitter.$off('set-pane');
    workspaceStore.dispatch.clearFilters();
  });

  return {
    id,
    space: workspaceStore.getters.space,

    openPane,
    closePane,
    togglePane,
    overrun,
  };
};
