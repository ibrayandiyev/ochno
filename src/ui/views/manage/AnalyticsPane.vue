<template>
  <Pane v-responsive="{ 'no-tab-titles': el => (el.width <= 500) }" :inactive-close="inactiveClose" class="bg-gray-2" @close-pane="$emit('close-pane', $event)">
    <template #icon>
      <Icon type="graph" />
    </template>
    <template #title>
      <span>{{ $t('Analyze') }}</span>
    </template>

    <div class="analytics vertical-overflow">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane v-for="g in graphers" :key="g.text" :name="g.text">
          <template #label>
            <Icon :type="g.icon" class="m-end" />
            <span class="graph-title">{{ $t(g.text) }}</span>
          </template>

          <AlertBar v-if="!showIndividual" :text="currentPortIds.length ? $t('Showing values from selected ports.') : $t('Showing values from all available space data.')" />

          <!-- A type of lazy loading. The tab is only rendered when it is the active tab. This stops all graphs from being updated when the settings change. -->
          <component
            :is="g.component"
            v-if="activeTab === g.text"
            :space-id="space.id"
            :port-ids="currentPortIds"
            :date="date"
            :show-individual="showIndividual"
            class="text-center"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </Pane>
</template>


<script>
import { ref, computed } from 'vue';

import AlertBar from '../../components/AlertBar.vue';
import Pane from '../../components/layout/Pane.vue';
import GraphClimate from '../../templates/metrics/GraphClimate.vue';
import GraphEnergy from '../../templates/metrics/GraphEnergy.vue';
import GraphLight from '../../templates/metrics/GraphLight.vue';
import GraphMotion from '../../templates/metrics/GraphMotion.vue';
import workspaceStore from '../../../modules/workspace/store';

const graphers = [
  { text: 'Energy', icon: 'electricity', component: GraphEnergy },
  { text: 'Motion', icon: 'motion', component: GraphMotion },
  { text: 'Light', icon: 'light', component: GraphLight },
  { text: 'Climate', icon: 'values', component: GraphClimate },
];

export default {
  components: { AlertBar, Pane, ...graphers.map(({ component }) => component) },

  props: {
    inactiveClose: { type: Number }, // In seconds
  },

  emits: ['close-pane'],

  setup() {
    const now = new Date();

    const { space, activeChoice, activeChoiceGrouped } = workspaceStore.getters;
    const currentPortIds = computed(() => (activeChoice.value.activeBy !== 'none' && activeChoiceGrouped.value.portIds) || []);

    return {
      graphers,

      activeTab: ref('Energy'),
      date: ref([
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
        // The span is until the end of today to capture all data from the day we are on.
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
      ]),

      space,
      currentPortIds,
      showIndividual: computed(() => currentPortIds.value.length > 0 && currentPortIds.value.length <= 10),
    };
  },
};
</script>


<style scoped lang="less">
.alert-bar {
  margin: var(--row-gap) var(--column-gap) 0;
}

.analytics:deep(.el-tabs) {
  .el-tabs__item {
    flex-grow: 0;
    padding: 0 calc((var(--common-size) - var(--icon-size)) / 2);
  }

  .chart {
    height: calc(var(--common-size) * 6);
    margin-bottom: 1rem;
  }

  .group-chart {
    height: calc(var(--common-size) * 4);
  }
}

// RESPONSIVE STATES
.no-tab-titles .graph-title {
  display: none;
}
</style>
