<template>
  <div class="control-fans control-width">
    <ControlMasterSlider
      :port-ids="portIds"
      device-type="fan"
      :paths="pathArr"
      :text="`${$t('Master fan controls')} (${$t('average')})`"
      :customize="customize"
    >
      <template #master>
        <ControlGrouped v-if="showGroupedOption" v-model="usePropsGroups" />
      </template>

      <template #list="{ portId }">
        <ControlFanAnimations v-if="showAnimations" :port-ids="[portId]" class="m-down" />
      </template>

      <template #single="{ portId }">
        <ControlFanAnimations v-if="showAnimations" :port-ids="[portId]" class="m-down" />
        <ControlGrouped v-if="showGroupedOption" v-model="usePropsGroups" />
      </template>
    </ControlMasterSlider>

    <div v-if="showGraph" class="chart-wrapper m-down text-center">
      <h3>{{ $t('Fans') }} ({{ $t('rpm') }})</h3>
      <Chart v-bind="plotly.rpm" @relayout="setWindow" />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { ref, reactive, computed, watch, watchEffect } from 'vue';

import ControlFanAnimations from './ControlFanAnimations.vue';
import ControlGrouped from './ControlGrouped.vue';
import ControlMasterSlider from '../../../../components/controls/ControlMasterSlider.vue';
import Chart from '../../../../components/Chart.vue';
import { settings as deviceSettings } from '../../../../utils/deviceTypeProperties';
import parseTimeString from '../../../../utils/parseTimeString';
import portsStore from '../../../../../modules/ports/store';
import { FAN, TARGET } from '../../../../../modules/ports/info/fan';

const fanSettings = deviceSettings[FAN];

const chartLayout = {
  showlegend: false,
  xaxis: { hoverformat: '%H.%M.%S', tickformat: '%H.%M.%S' },
  yaxis: { rangemode: 'tozero' },
};

const chartConfig = {
  scrollZoom: false,
};

export default {
  components: { ControlFanAnimations, ControlGrouped, ControlMasterSlider, Chart },

  props: {
    portIds: { type: Array, default: () => [] },
    paths: { type: Array, default: () => [TARGET] },
    customize: { type: Object, default: () => ({}) },
    // {
    //   fan: {
    //     animations: { type: Boolean },
    //     rpmGraph: { type: Boolean },
    //     groupedOption: { type: Boolean },
    //   },
    //   ...see ControlSliders for more.
    // }
  },

  setup(props) {
    const plotly = reactive({}); // Filled up dynamically below.
    const usePropsGroups = ref(true);

    const fans = computed(() => _.pick(portsStore.state[FAN], props.portIds));
    const showAnimations = computed(() => props.customize?.fan?.animations);
    const showGraph = computed(() => props.customize?.fan?.rpmGraph);
    const showGroupedOption = computed(() => props.customize?.fan?.groupedOption && props.paths.indexOf(TARGET) >= 0);

    const getPortPlot = (portId, measurement, layout = chartLayout, config = chartConfig, settings = {}) => {
      if (!plotly[measurement]) {
        plotly[measurement] = { data: [], layout, config, xWindow: 60 };
      }

      const { data } = plotly[measurement];
      const plot = data.find(({ id }) => id === portId);
      if (plot) {
        return plot;
      }

      data.push(_.extend({ id: portId, name: '', type: 'line', x: [], y: [] }, settings));
      return data[data.length - 1];
    };

    const pushDataPoint = (data, time, value) => {
      if (value !== undefined && value !== null) {
        data.x.push(time);
        data.y.push(value);
      }
    };

    const updatePlotly = (id, fan) => {
      if (showGraph.value) {
        // const timestamp = this.portData(port, 't');
        // const date = timestamp ? new Date(timestamp) : new Date();
        const date = new Date();

        Object.entries(fan).forEach(([key, value]) => {
          if (key.startsWith('rpm')) {
            const data = getPortPlot(`${id}-${key}`, 'rpm');
            pushDataPoint(data, date, value);
          }
        });
      }
    };

    const removePortPlot = (portId) => {
      Object.values(plotly).forEach(({ data }) => {
        // NOTE: Splicing in looped array below, so let's not use forEach since it is not index protected.
        for (let i = 0; i < data.length; i++) {
          const { id } = data[i];
          if (id.startsWith(portId)) {
            data.splice(i, 1);
            i -= 1;
          }
        }
      });
    };

    watch(
      () => props.portIds,
      (newPortIds, oldPortIds) => {
        if (oldPortIds) { // Remove old plots when they are no longer chosen.
          oldPortIds.forEach((id) => (newPortIds.indexOf(id) < 0 && removePortPlot(id)));
        }
      },
    );

    watchEffect(() => Object.entries(fans.value).forEach(([id, fan]) => updatePlotly(id, fan)));

    return {
      plotly,
      usePropsGroups,
      showAnimations,
      showGraph,
      showGroupedOption,

      pathArr: computed(() => {
        if (showGroupedOption.value && !usePropsGroups.value) {
          const paths = _.flatten(props.paths.map((path) => {
            const setting = _.get(fanSettings, path);
            return setting && (setting.props || setting.prop);
          }));
          return paths;
        }

        return props.paths;
      }),

      setWindow(graph, traces) {
        const stop = traces?.[0]?.['xaxis.range[1]'];
        if (stop && new Date(parseTimeString(stop)) < (graph.data?.[0]?.x || []).slice(-1)[0]) {
          graph.xWindow = 0; // eslint-disable-line no-param-reassign
        } else {
          graph.xWindow = 60; // eslint-disable-line no-param-reassign
        }
      },
    };
  },
};
</script>

<style scoped lang="less">
.chart-wrapper {
  margin-top: var(--common-size);
}

.chart {
  height: calc(var(--common-size) * 4);
}
</style>
