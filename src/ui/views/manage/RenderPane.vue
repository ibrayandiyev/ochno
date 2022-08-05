<template>
  <div class="map fill-height bg-gray-1" :class="classes">
    <Upload
      v-if="emptySpace"
      accept="image/*,.dxf"
      upload-text="Drop a design or click here to upload"
      class="fill-height centered"
      style="background: inherit;"
      @input="upload('postImage', $event)"
    />

    <div
      v-else
      class="fill-height relative"
      :class="tool ? `tool-${tool}` : ''"
    >
      <Renderer
        :space-id="item.id"
        :editable="editable"
        @map-click="mapClick"
        @box-select="boxSelect"
        @item-click="itemClick"
        @item-dragged="itemDragged"
      />
    </div>
  </div>
</template>


<script>
import _ from 'lodash';
import { computed } from 'vue';

import Upload from '../../components/Upload.vue';
import useSave from '../../composables/useSave';
import Renderer from '../../templates/spaces/renderer/Renderer.vue';
import spacesStore from '../../../modules/spaces/store';
import workspaceStore, { TOOLS } from '../../../modules/workspace/store';

export default {
  components: { Renderer, Upload },

  setup() {
    const { space, hasChoice, activeChoice } = workspaceStore.getters;

    const save = useSave({ actual: space, store: spacesStore });

    const mapClick = (event) => {
      if (workspaceStore.state.tool !== TOOLS.multi && !event?.originalEvent?.shiftKey) {
        // Clear selection in case user is not using tool multi or holding down shift.
        workspaceStore.dispatch.clear(['selection']);
      }
    };

    const itemClick = ({ itemId, shiftKey }) => {
      workspaceStore.dispatch.toggle({ itemId, multi: shiftKey || undefined }); // Set to undefined to get default value in workspace.
    };

    const boxSelect = (ids) => {
      // Select all items that aren't selected. If everyone is selected, then unselect.
      let selectIds = ids; // no need to clone
      const { activeBy, itemIds } = activeChoice.value;
      if (activeBy === 'selection' || activeBy === 'editing') {
        const unselectedIds = _.difference(selectIds, itemIds);
        if (unselectedIds.length) {
          selectIds = unselectedIds;
        }
      }
      selectIds.forEach((itemId) => itemClick({ itemId, shiftKey: true }));
    };

    const itemDragged = ({ itemId, point, points }) => {
      const item = save.item.items.find(({ id }) => id === itemId);
      if (item) {
        if (point) {
          item.point = point;
        }
        if (points) {
          item.points = points;
        }
        save.saveItem(undefined, true); // Need to force update since we are changing the point reference directly.
      }
    };

    return {
      ...save,

      tool: computed(() => workspaceStore.state.tool),
      classes: computed(() => ({
        ...hasChoice.value,
        'color-primary-inverted': hasChoice.value['has-editing'] || hasChoice.value['has-highlighting'],
      })),
      emptySpace: computed(() => !space.value?.items?.length),
      editable: computed(() => workspaceStore.state.tool === TOOLS.move),

      mapClick,
      itemClick,
      boxSelect,
      itemDragged,
    };
  },
};
</script>


<style scoped lang="less">
.tool-drawSection .map-editor {
  cursor: crosshair;
}
.tool-move .map-editor:deep(.marker) {
  cursor: move;
}
</style>
