<template>
  <Pane v-responsive="{ 'no-control-number': el => el.width <= 350, 'no-control-label': el => el.width <= 300 }" v-visibility="visibilityChanged" v-page-visibility="visibilityChanged" class="bg-gray-2" @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="controls" />
    </template>
    <template #title>
      <span>{{ $t('Control') }}</span>
    </template>

    <div class="control-content vertical-overflow">
      <el-tabs v-model="activeTab" type="card" class="component-controls">
        <template v-for="tab in availableTabs" :key="tab.type">
          <el-tab-pane :name="tab.type" :lazy="tab.lazy !== false">
            <template #label>
              <Icon :type="tab.type" />
            </template>

            <component :is="tab.component" v-bind="tab.parameters" />
          </el-tab-pane>
        </template>
      </el-tabs>
    </div>
  </Pane>
</template>


<script>
import { ref, computed, watch, watchEffect, nextTick } from 'vue';

import Pane from '../../components/layout/Pane.vue';
import useIotStream from '../../composables/useIotStream';
import ControlEdges from '../../templates/edges/controls/ControlEdges.vue';
import ControlHubs from '../../templates/hubs/controls/ControlHubs.vue';
import ControlPorts from '../../templates/ports/controls/ControlPorts.vue';
import { componentMap, deviceMap } from '../../templates/ports/controls/deviceMap';
import ControlSections from '../../templates/spaces/controls/sections/ControlSections.vue';
import portsStore from '../../../modules/ports/store';
import workspaceStore from '../../../modules/workspace/store';

const deviceParams = {
  fan: { customize: { fan: { animations: true, rpmGraph: true, groupedOption: true } } },
  sensor: { customize: { header: {} } }, // To show header.
};

export default {
  components: { ...componentMap, ControlEdges, ControlHubs, ControlPorts, ControlSections, Pane },

  emits: ['close-pane'],

  setup(props, { emit }) {
    const { space, activeChoiceGrouped } = workspaceStore.getters;
    const { mapTypes } = portsStore.getters;

    const activeTab = ref(null);
    const streamingPortIds = ref(null);

    useIotStream({ ports: streamingPortIds });

    const activePortIds = computed(() => {
      // Only choose the ports that are active and that are not marked as nonexistent.
      const { portIds } = activeChoiceGrouped.value;
      const { info } = portsStore.state;
      return portIds?.filter((portId) => info[portId] && !info[portId].nonexistent);
    });

    const availableTabs = computed(() => {
      const { edgeIds, hubIds, sectionIds, portIds } = activeChoiceGrouped.value;
      const tabs = [];

      if (edgeIds) {
        tabs.push({ type: 'edge', component: ControlEdges, parameters: { edgeIds, space: space.value } });
      }
      if (hubIds) {
        tabs.push({ type: 'hub', component: ControlHubs, parameters: { hubIds, space: space.value } });
      }
      if (sectionIds) {
        tabs.push({ type: 'section', component: ControlSections, parameters: { sectionIds, space: space.value } });
      }
      if (portIds) {
        tabs.push({ type: 'port', component: ControlPorts, parameters: { portIds, space: space.value }, lazy: false }); // Do not lazy load, since we need the plots to update.
        const portTypesMap = mapTypes.value(activePortIds.value);

        Object.entries(deviceMap).forEach(([deviceType, { component }]) => {
          const deviceIds = portTypesMap[deviceType];
          if (deviceIds) {
            const params = deviceParams[deviceType] || {};
            tabs.push({ type: deviceType, component, parameters: { portIds: deviceIds, space: space.value, ...params }, lazy: deviceType === 'sensor' }); // Do not lazy load sensor.
          }
        });
      }

      return tabs;
    });

    watch(
      () => availableTabs.value,
      (newValue) => {
        if (!newValue?.length) {
          activeTab.value = null;
        } else if (!activeTab.value || !newValue.find((tab) => tab.type === activeTab.value)) {
          // Set tab when ports change, trying to make a "smart" choice and making sure that a tab is selected.
          const deviceType = Object.keys(deviceMap).find((type) => newValue.find((tab) => tab.type === type));
          if (deviceType) {
            activeTab.value = deviceType;
          } else {
            activeTab.value = newValue[newValue.length - 1].type;
          }
        }
      },
      { immediate: true },
    );

    watchEffect(() => {
      // This solution has been implemented to handle the case where the user clicks the x to close this pane.
      // If this is not in place, the activePortIds will have changed before the pane is unmounted.
      // Which in turn leads to the streamingPortIds publishing mqtt messages for streaming (in useIotStream).
      const active = activePortIds.value;
      nextTick(() => {
        streamingPortIds.value = active;
      });
    });

    return {
      emit,

      activeTab,
      availableTabs,

      visibilityChanged(isVisible) {
        if (isVisible) {
          streamingPortIds.value = activePortIds.value;
        } else {
          streamingPortIds.value = null;
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.rotate {
  animation: rotate 4s infinite linear;
}

.control-content:deep(.el-tabs) { // Control component styles
  .el-tabs__item {
    width: var(--common-size);
  }

  .el-tabs__nav {
    width: auto;
  }
}

.control-content:deep(.el-tabs__content) {
  padding: 0 10%;
}
</style>
