/* Current workspace items. No passing around values, quick and in-sync data store for different workspaces. */
import _ from 'lodash';
import { reactive, computed } from 'vue';

import edgesStore from '../edges/store';
import hubsStore from '../hubs/store';
import mechanismsStore from '../mechanisms/store';
import spacesStore from '../spaces/store';

const defaultState = {
  spaceId: null,

  tool: null,
  editing: null,
  selection: null,
  highlighting: null,
  container: null,
  selectable: null,
};

const stateKeys = Object.keys(defaultState);
const choiceKeys = ['editing', 'selection', 'highlighting']; // Order is important!
const mapId = ({ id }) => id;

export const TOOLS = {
  multi: 'multi', // multi select
  box: 'box', // box select
  move: 'move', // move items
  drawSection: 'drawSection', // draw a new section
};

const state = reactive(_.cloneDeep(defaultState));

const getters = {
  space: computed(() => spacesStore.state.spaces[state.spaceId]),
  itemIds: computed(() => (getters.space.value?.items || []).filter(({ type }) => type !== 'image').map(mapId)),

  hubIds: computed(() => spacesStore.getters.filterItems.value({ id: state.spaceId, type: 'hub' }).map(mapId)),
  hubs: computed(() => _.pick(hubsStore.state.hubs, getters.hubIds.value)),
  edgeIds: computed(() => spacesStore.getters.filterItems.value({ id: state.spaceId, type: 'edge' }).map(mapId)),
  edge: computed(() => _.pick(edgesStore.state.edges, getters.edgeIds.value)[0]),
  portIds: computed(() => spacesStore.getters.filterItems.value({ id: state.spaceId, type: 'port' }).map(mapId)),
  sectionIds: computed(() => spacesStore.getters.filterItems.value({ id: state.spaceId, type: 'section' }).map(mapId)),
  mechanisms: computed(() => mechanismsStore.getters.filtered.value({ spaceId: [state.spaceId] })),

  // Get an item in the current space by it's id.
  spaceItem: computed(() => (itemId) => spacesStore.getters.spaceItem.value({ id: state.spaceId, itemId })),

  /* Returns if a specific port is chosen (editing, selection, highlighting). Returned as an object, ex: { selection: true } */
  getItemChoice: computed(() => (id) => {
    const status = {};
    choiceKeys.forEach((key) => {
      const chosenPorts = _.get(state[key], 'itemIds');
      if (chosenPorts && chosenPorts.indexOf(id) >= 0) {
        status[key] = true;
      }
    });
    return status;
  }),

  /* Returns if there is a current choice made (editing, selection, highlighting). Returned as an object, ex: { has-selection: true } */
  hasChoice: computed(() => ({
    'has-selection': !!state?.selection?.itemIds?.length,
    'has-highlighting': !!state?.highlighting?.itemIds,
    'has-editing': !!state?.editing?.itemIds,
  })),

  /* Returns the items that are currently active by the filter. */
  activeFilter: computed(() => ({ activeBy: 'none', itemIds: getters.itemIds.value })),

  /* Returns the items that are currently chosen. Using containers in following order: editing, selection, highlighting. */
  activeChoice: computed(() => {
    for (let i = 0; i < choiceKeys.length; i++) {
      const containerName = choiceKeys[i];
      const itemIds = _.get(state[containerName], 'itemIds', []);
      if (itemIds.length) {
        return { activeBy: containerName, itemIds };
      }
    }

    return getters.activeFilter.value;
  }),

  activeChoiceGrouped: computed(() => {
    const { itemIds } = getters.activeChoice.value;
    const grouped = {};
    itemIds.forEach((id) => {
      const item = getters.spaceItem.value(id);
      if (!grouped[`${item.type}Ids`]) {
        grouped[`${item.type}Ids`] = [];
      }
      grouped[`${item.type}Ids`].push(id);
    });
    return grouped;
  }),
};


function setter(values) {
  stateKeys.forEach((key) => {
    if (values[key] !== undefined) {
      state[key] = values[key];
    }
  });
}

function selector({ container, selectable, values }) {
  if (!state[container]) {
    state[container] = {};
  }
  if (!Array.isArray(state[container].itemIds)) {
    state[container].itemIds = [];
  }

  const vals = _.castArray(values);
  const arr = state[container].itemIds;
  vals.forEach((val) => {
    if (!selectable || getters.spaceItem.value(val)?.type === selectable) {
      if (arr.indexOf(val) < 0) {
        arr.push(val);
      }
    }
  });
}

function unselector({ container, values }) {
  const arr = _.get(state, `${container}.itemIds`);
  if (arr && arr.length) {
    const vals = _.castArray(values);
    vals.forEach((val) => {
      const index = arr.indexOf(val);
      if (index >= 0) {
        arr.splice(index, 1);
      }
    });
  }
}

const dispatch = {
  // Set the values of the workspace.
  // If a value is excluded, the previous one will be used, ex: { spaceId: spaceId } will not update selection.
  // Clear a value by sending null, ex: { spaceId: null }.
  set(values) {
    setter(values);
  },

  clear(picks) {
    if (!picks) {
      dispatch.set(_.cloneDeep(defaultState));
    } else {
      dispatch.set(_.cloneDeep(_.pick(defaultState, picks)));
    }
  },

  select({ itemIds, container = _.get(state, 'container') || 'selection', selectable = state.selectable, multi = state.tool === TOOLS.multi }) {
    if (!multi) {
      dispatch.set({ [container]: null });
    }

    if (itemIds) {
      selector({ container, selectable, values: itemIds });

      // Select items that are inside points, if any.
      const polygonIds = _.castArray(itemIds).filter((id) => {
        const item = getters.spaceItem.value(id);
        return item.points;
      });
      if (polygonIds.length) {
        const itemsInside = spacesStore.getters.filterItems.value({ id: state.spaceId, polygonIds });
        const idsInside = itemsInside.filter(({ id }) => id && (itemIds.indexOf(id) < 0)).map(({ id }) => id);
        dispatch.select({ itemIds: idsInside, container, multi: true });
      }
    }
  },

  unselect({ itemIds, container = _.get(state, 'container') || 'selection' }) {
    if (itemIds) {
      unselector({ container, values: itemIds });

      // Deselect items that are inside points, if any.
      const polygonIds = _.castArray(itemIds).filter((id) => {
        const item = getters.spaceItem.value(id);
        return item.points;
      });

      if (polygonIds.length) {
        const itemsInside = spacesStore.getters.filterItems.value({ id: state.spaceId, polygonIds });
        const idsInside = itemsInside.filter(({ id }) => id && (itemIds.indexOf(id) < 0)).map(({ id }) => id);
        dispatch.unselect({ itemIds: idsInside, container });
      }
    }
  },

  toggle({ itemId, container = _.get(state, 'container') || 'selection', multi = state.tool === TOOLS.multi }) {
    if (itemId) {
      const arr = _.get(state, `${container}.itemIds`) || [];
      if (arr.indexOf(itemId) < 0 || (!multi && arr.length > 1)) { // Use select if not selected or if not multi-selecting in an array of two or more. This is to get the correct selection feeling in the ui.
        dispatch.select({ container, multi, itemIds: itemId });
      } else {
        dispatch.unselect({ container, itemIds: itemId });
      }
    }
  },

  // Actions to make life more comfortable:
  clearFilters() {
    dispatch.clear(['tool', 'editing', 'selection', 'highlighting', 'container', 'selectable']);
  },
};

export default {
  state,
  getters,
  dispatch,
};
