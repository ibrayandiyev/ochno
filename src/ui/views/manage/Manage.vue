<template>
  <Workspace v-page-title="((space && space.name) ? `${space.name} - ` : '') + $t('Manage')" @overrun="overrun">
    <!-- Top menu -->
    <template #menu>
      <ManageMenu />
    </template>

    <!-- Pane switches -->
    <template #function>
      <el-checkbox :model-value="panes.info.open" class="-square -common-height bg-transparent" @input="togglePane(panes.info)">
        <Icon type="controls" />
        <h3 class="function-text">{{ $t('Control') }}</h3>
      </el-checkbox>

      <el-checkbox :model-value="panes.automation.open" class="-square -common-height bg-transparent" @input="togglePane(panes.automation)">
        <Icon type="toolbox" />
        <h3 class="function-text">{{ $t('Automate') }}</h3>
      </el-checkbox>

      <el-checkbox :model-value="panes.analytics.open" class="-square -common-height bg-transparent" @input="togglePane(panes.analytics)">
        <Icon type="graph" />
        <h3 class="function-text">{{ $t('Analyze') }}</h3>
      </el-checkbox>
    </template>

    <!-- Content -->
    <Spinner v-if="spacesFetching || portsFetching" />
    <RenderPane v-else />

    <!-- Panes -->
    <template #panes>
      <Controls
        v-if="!panes.space.hidden"
        min="200px"
      />

      <ControlPane
        v-if="panes.info.open || panes.info.hidden"
        min="250px"
        init="550px"
        :style="{ display: panes.info.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.info)"
      />

      <AutomationPane
        v-if="panes.automation.open || panes.automation.hidden"
        min="340px"
        init="550px"
        :style="{ display: panes.automation.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.automation)"
      />

      <AnalyticsPane
        v-if="panes.analytics.open || panes.analytics.hidden"
        min="300px"
        init="600px"
        :style="{ display: panes.analytics.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.analytics)"
      />
    </template>
  </Workspace>
</template>


<script>
import { reactive, computed } from 'vue';

import AnalyticsPane from './AnalyticsPane.vue';
import AutomationPane from './AutomationPane.vue';
import ControlPane from './ControlPane.vue';
import ManageMenu from './ManageMenu.vue';
import RenderPane from './RenderPane.vue';
import useFetchers from '../../composables/useFetchers';
import useIotSubscribe from '../../composables/useIotSubscribe';
import useWorkspace from '../../components/layout/useWorkspace';
import Workspace from '../../components/layout/Workspace.vue';
import Controls from '../../templates/spaces/renderer/Controls.vue';
import edgesStore from '../../../modules/edges/store';
import hubsStore from '../../../modules/hubs/store';
import portsStore from '../../../modules/ports/store';
import spacesStore from '../../../modules/spaces/store';
import workspaceStore from '../../../modules/workspace/store';

export default {
  components: { AnalyticsPane, AutomationPane, ControlPane, Controls, RenderPane, ManageMenu, Workspace },

  setup() {
    const panes = reactive({
      space: { open: true, hidden: false, time: Date.now(), permanent: true },
      setup: { open: false, hidden: false, time: 0 },
      info: { open: false, hidden: false, time: 0, selection: true }, // Pane that reacts on selection.
      automation: { open: false, hidden: false, time: 0 },
      analytics: { open: false, hidden: false, time: 0 },
    });

    const { id, space, closePane, togglePane, overrun } = useWorkspace({
      panes,
      shouldOpenSelectionPane: computed(() => !(panes.automation.open || panes.analytics.open)),
    });

    useFetchers([
      { store: spacesStore, action: 'getOne', params: () => ({ id: id.value }), trigger: id },
      { store: hubsStore, params: () => ({ id: workspaceStore.getters.hubIds.value }), trigger: computed(() => (workspaceStore.getters.hubIds.value.length ? workspaceStore.getters.hubIds.value : null)) },
      { store: portsStore, params: () => ({ id: workspaceStore.getters.portIds.value }), trigger: computed(() => (workspaceStore.getters.portIds.value.length ? workspaceStore.getters.portIds.value : null)) },
      { store: edgesStore, params: () => ({ id: workspaceStore.getters.edgeIds.value }), trigger: computed(() => (workspaceStore.getters.edgeIds.value.length ? workspaceStore.getters.edgeIds.value : null)) },
    ]);

    useIotSubscribe({ space });

    return {
      panes,

      space,
      closePane,
      togglePane,
      overrun,

      spacesFetching: computed(() => spacesStore.state.fetching.value),
      portsFetching: computed(() => portsStore.state.fetching.value),
    };
  },
};
</script>


<style scoped lang="less">
</style>
