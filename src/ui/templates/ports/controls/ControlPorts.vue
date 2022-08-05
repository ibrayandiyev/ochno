<template>
  <div class="control-ports">
    <ControlHeader :port-ids="portIds" device-type="ochnoOperated">
      <h3>{{ $t('Ports') }}</h3>
    </ControlHeader>

    <div class="m-down text-center">
      <h3>{{ $t('Power consumption') }} ({{ $t('W') }})</h3>
      <Chart v-bind="plotly" @relayout="setWindow" />
    </div>

    <el-collapse v-model="expanded" class="control-width">
      <ControlPort v-for="portId in portIds" :key="portId" :port-id="portId" :space="space" />
    </el-collapse>
  </div>
</template>


<script>
import _ from 'lodash';
import { ref, reactive, computed, watch, watchEffect } from 'vue';

import ControlPort from './ControlPort.vue';
import ControlHeader from '../../../components/controls/ControlHeader.vue';
import Chart from '../../../components/Chart.vue';
import parseTimeString from '../../../utils/parseTimeString';
import portsStore from '../../../../modules/ports/store';

const chartLayout = {
  xaxis: { hoverformat: '%H.%M.%S', tickformat: '%H.%M.%S' },
  yaxis: { rangemode: 'tozero' },
};

const chartConfig = {
  scrollZoom: false,
};

export default {
  components: { ControlHeader, ControlPort, Chart },

  props: {
    portIds: { type: Array, default: () => [] },
    space: { type: Object, required: true },
  },

  setup(props) {
    const expanded = ref([]);

    const plotly = reactive({
      data: [
        { name: 'Power', type: 'line', x: [], y: [] },
      ],
      layout: chartLayout,
      config: chartConfig,
      xWindow: 60,
    });

    const powers = computed(() => _.pick(portsStore.state.power, props.portIds));

    function pushDataPoint(time, value) {
      if (_.isNumber(value)) {
        plotly.data[0].x.push(time);
        plotly.data[0].y.push(value);
      }
    }

    function updatePlotly() {
      pushDataPoint(new Date(), _.sum(Object.values(powers.value).map(({ watt }) => watt)) / 1000);
    }

    watch(
      () => props.portIds,
      (newValue) => {
        // Reset plot when ports change.
        plotly.data[0].x = [];
        plotly.data[0].y = [];

        if (newValue?.length === 1) {
          expanded.value = [newValue[0]];
        }
      },
      { immediate: true },
    );

    watchEffect(() => {
      if (powers.value) {
        updatePlotly();
      }
    });

    return {
      expanded,
      plotly,

      setWindow(traces) {
        const stop = traces && traces[0] && traces[0]['xaxis.range[1]'];
        if (stop && new Date(parseTimeString(stop)) < _.get(plotly.data, '[0].x', []).slice(-1)[0]) {
          plotly.xWindow = 0;
        } else {
          plotly.xWindow = 60;
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.chart {
  height: calc(var(--common-size) * 4);
}
</style>
