<template>
  <el-collapse-item :name="edgeId" class="control-edge">
    <!-- Title -->
    <template #title>
      <div class="bg-transparent -circle" :style="spaceEdge ? '' : 'visibility: hidden'"><Icon type="edge" /></div>
      <h3>
        <span>{{ spaceEdge ? title(edgeId) : $t('Removed edge') }}</span>
        <span v-if="edgeName" style="opacity: 0.5"> - {{ edge && edge.hwId }}</span>
      </h3>
    </template>

    <!-- Content -->
    <template v-if="!edge">
      <AlertBar :text="$t('Item is no longer connected to this space')" class="m-down" />

      <div class="control-grid no-control-label">
        <div>{{ $t('Remove from space') }}</div>
        <el-button class="-square -borderless" @click="removeEdge(false)"><Icon type="bin" /></el-button>
      </div>
    </template>

    <template v-else>
      <div class="control-grid m-down">
        <div class="label -circle"><Icon type="edit" /></div>
        <div>{{ $t('Name') }}</div>
        <Field v-model="edgeName" :disabled="!edge" />

        <div class="label bg-transparent -circle"><Icon type="info" /></div>
        <div>{{ $t('Hardware id') }}</div>
        <div class="text-selectable text-right p-block-s">{{ edge.hwId }}</div>

        <div class="label -circle"><Icon type="bin" /></div>
        <div>{{ $t('Remove from space') }}</div>
        <el-button class="-square -borderless" @click="removeEdge(true)">{{ $t('Remove') }}</el-button>
      </div>
    </template>
  </el-collapse-item>
</template>


<script>
import { ElMessageBox } from 'element-plus';
import i18next from 'i18next';
import _ from 'lodash';
import { computed } from 'vue';

import AlertBar from '../../../components/AlertBar.vue';
import useSave from '../../../composables/useSave';
import edgesStore from '../../../../modules/edges/store';
import spacesStore from '../../../../modules/spaces/store';
import workspaceStore from '../../../../modules/workspace/store';

export default {
  components: { AlertBar },

  props: {
    edgeId: { type: String, required: true },
    space: { type: Object, required: true },
  },

  setup(props) {
    const edge = computed(() => edgesStore.state.edges[props.edgeId]);

    const save = useSave({ actual: computed(() => props.space), store: spacesStore });
    const saveEdge = useSave({ actual: edge, store: edgesStore });

    const spaceEdge = computed(() => save.item?.items?.find((item) => item.id === props.portId));

    return {
      edge,
      spaceEdge,
      title: edgesStore.getters.title,

      edgeName: computed({
        get: () => edge.value?.name,
        set: (value) => {
          if (saveEdge.item) {
            saveEdge.item.name = value;
            saveEdge.saveItem();
          }
        },
      }),

      async removeEdge(confirm) {
        const index = _.findIndex(save.item?.items, (item) => item.id === props.edgeId);
        if (index >= 0) {
          if (confirm) {
            try {
              await ElMessageBox.confirm(
                i18next.t('Removing an edge will also disable offline automation. Ports connected to the Internet will still have cloud automation available. Is this ok?'),
                i18next.t('Remove edge'),
                {
                  cancelButtonText: i18next.t('Cancel'),
                  confirmButtonText: i18next.t('Yes'),
                },
              );
            } catch (error) {
              return;
            }
          }

          workspaceStore.dispatch.unselect({ itemIds: props.edgeId });
          save.item.items.splice(index, 1);
          save.saveItem();
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.control-edge:deep(.el-collapse-item__header) {
  padding-left: 0;
}

.control-edge:deep(.el-collapse-item__content) {
  max-width: var(--max-width-controls);
  margin: 0 auto;
  padding: var(--column-gap) var(--column-gap) var(--row-gap) 0;
}
</style>
