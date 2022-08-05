<template>
  <Pane v-responsive="{ 'no-control-label': el => el.width <= 450 }" :scrollbar="false" class="scrollbar-fill" @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="toolbox" />
    </template>
    <template #title>
      <span>{{ $t('Automate') }}</span>
    </template>

    <el-tabs type="card">
      <el-tab-pane>
        <template #label>
          <Icon type="toolbox" style="margin-right: 1rem" />
          <span>Mechanisms</span>
        </template>
        <MechanismList />
      </el-tab-pane>

      <el-tab-pane :lazy="true">
        <template #label>
          <Icon type="controls" style="margin-right: 1rem" />
          <span>Controls</span>
        </template>
        <MechanismControlList />
      </el-tab-pane>
    </el-tabs>
  </Pane>
</template>


<script>
import { computed } from 'vue';

import Pane from '../../components/layout/Pane.vue';
import useFetchers from '../../composables/useFetchers';
import MechanismControlList from '../../templates/mechanismcontrols/MechanismControlList.vue';
import MechanismList from '../../templates/mechanisms/MechanismList.vue';
import mechanismControlsStore from '../../../modules/mechanismcontrols/store';
import mechanismsStore from '../../../modules/mechanisms/store';
import workspaceStore from '../../../modules/workspace/store';

export default {
  components: { MechanismControlList, MechanismList, Pane },

  emits: ['close-pane'],

  setup(props, { emit }) {
    const controlsParams = computed(() => {
      const mechanisms = workspaceStore.getters.mechanisms.value;
      if (mechanisms && !mechanismsStore.state.fetching) {
        return { mechanismIds: mechanisms.map(({ id }) => id) };
      }
      return null;
    });

    useFetchers([
      { store: mechanismsStore, params: () => ({ spaceId: workspaceStore.getters.space.value?.id }) },
      { store: mechanismControlsStore, params: () => controlsParams.value, trigger: controlsParams },
    ]);

    return {
      emit,
    };
  },
};
</script>


<style scoped lang="less">
.el-tabs {
  height: 100%;
}

.el-tabs:deep(.el-tabs__content) {
  height: ~'calc(100% - var(--common-size))';
}

// Children of this file.
.pane:deep(.mechanism-wrapper) {
  padding: 1rem 5% 3rem;
}

.pane:deep(.mechanism-wrapper) {
  .el-collapse-item__header {
    .drag-handle {
      width: calc(var(--common-size) * 0.75);
      height: var(--common-size);
      margin-left: calc(var(--common-size) * -0.5);
      color: rgba(var(--color-nature), var(--opacity-medium));
      cursor: move;

      &:hover {
        color: rgba(var(--color-nature), var(--opacity-heavy));
      }
    }

    .title-header {
      color: rgb(var(--color-gray-5));

      + .title-header {
        margin-left: 0.5em;
        opacity: 0.75;
        text-transform: lowercase;
      }
    }

    &.is-active,
    &:hover {
      .title-header {
        color: inherit;
      }
    }
  }

  .info-wrapper {
    max-width: 35rem;
    margin-left: auto;
    margin-right: auto;
    padding: 0 10% var(--row-gap);
  }

  .part-action {
    height: var(--common-size);
    margin: 0 auto;
    opacity: 0.7;
    border-color: transparent;
  }

  .add-select {
    background: transparent !important;
  }

  .remove-dropzone {
    &:hover {
      color: rgb(var(--color-nature));

      .part-action {
        opacity: 1;
      }
    }

    .absolute-cover {
      opacity: 0;
    }

    .part-action {
      box-sizing: border-box;
      padding-right: 1rem;
    }
  }

  .actions-grid {
    grid-template-columns: minmax(0, calc((var(--field-size) * 2) + 1rem)) 1fr auto auto;
    justify-items: center;
    margin: calc(var(--row-gap) * 1.5) auto;
  }
}
</style>
