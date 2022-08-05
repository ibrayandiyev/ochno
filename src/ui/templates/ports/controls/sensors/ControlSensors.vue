<template>
  <div class="control-sensors">
    <ControlHeader :port-ids="portIds" device-type="sensor" :text="$t('All sensors')" :customize="customize.header" />

    <template v-if="showGraph">
      <div v-for="key in selectedDataPoints" :key="key" class="m-down">

        <template v-if="showLatest">
          <div class="control-grid" style="padding-right: 2.5rem">
            <div class="-circle"><Icon :type="measurementIcon[key]" /></div>
            <h3>{{ $t(key) }}</h3>
            <div style="justify-self: flex-end">{{ latestValue(key) }}</div>
          </div>
        </template>
        <template v-else>
          <h3 class="text-center">{{ $t(key) }} <span v-if="$t(`${key}Unit`)">({{ $t(`${key}Unit`) }})</span></h3>
        </template>

        <Chart v-bind="plotly[key]" @relayout="setWindow(plotly[key], $event)" />
      </div>
    </template>

    <template v-else-if="showLatest">
      <div class="latest-grid grid">
        <template v-for="key in selectedDataPoints" :key="key">
          <el-tooltip placement="top" :content="$t(key)">
            <div class="-circle"><Icon :type="measurementIcon[key]" /></div>
          </el-tooltip>
          <div>{{ latestValue(key) }}</div>
        </template>
      </div>
    </template>
  </div>
</template>


<script>
import i18next from 'i18next';
import _ from 'lodash';
import { reactive, computed, watch, watchEffect } from 'vue';

import ControlHeader from '../../../../components/controls/ControlHeader.vue';
import Chart from '../../../../components/Chart.vue';
import parseTimeString from '../../../../utils/parseTimeString';
import portsStore from '../../../../../modules/ports/store';

const chartLayout = {
  showlegend: false,
  xaxis: { hoverformat: '%H.%M.%S', tickformat: '%H.%M.%S' },
  yaxis: { rangemode: 'tozero' },
};

const motionChartLayout = _.merge({
  yaxis: {
    range: [-0.05, 1.05],
    tickmode: 'array',
    tickvals: [0, 1],
    ticktext: ['Off', 'On'],
    showgrid: false,
  },
}, chartLayout);

const chartConfig = {
  scrollZoom: false,
};

const motionPlotSettings = {
  fill: 'tozeroy',
  hoverinfo: 'x',
  line: { shape: 'hv' },
};

const measurements = ['luminosity', 'lightclear', 'lighttemperature', 'temperature', 'airhumidity', /* 'airpressure', */ 'airco2', 'airtvoc']; // motion is a special case.

const format = {
  motion(val) {
    return val ? 1 : 0;
  },
  temperature(val) {
    return val / 100;
  },
  airhumidity(val) {
    return val / 100;
  },
};

const icons = {
  motion: 'motion',
  luminosity: 'light',
  lightclear: 'light',
  lighttemperature: 'light',
  temperature: 'temp',
  airhumidity: 'values',
  airpressure: 'values',
  airco2: 'values',
  airtvoc: 'values',
};

export default {
  components: { ControlHeader, Chart },

  props: {
    portIds: { type: Array, default: () => [] },
    paths: { type: Array },
    customize: { type: Object, default: () => ({ header: { icon: false, label: false, text: false } }) },
    // {
    //   header: {
    //     ... see ControlHeader.
    //   },
    //   sensor: {
    //     graph: { type: Boolean },
    //     latest: { type: Boolean },
    //   },
    // }
  },

  setup(props) {
    const plotly = reactive({}); // Filled up dynamically below.

    const sensors = computed(() => _.pick(portsStore.state.sensor, props.portIds));

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

    const updatePlotly = (id, sensor) => {
      // TODO: Timestamps
      // const timestamp = this.portData(port, 't');
      // const date = timestamp ? new Date(timestamp) : new Date();
      const date = new Date();

      if (!_.isNil(sensor.motion)) { // motion uses a special case.
        const data = getPortPlot(id, 'motion', motionChartLayout, chartConfig, motionPlotSettings);
        pushDataPoint(data, date, format.motion(sensor.motion));
      }

      Object.entries(_.pick(sensor, measurements)).forEach(([key, value]) => {
        if (value) {
          const data = getPortPlot(id, key);
          pushDataPoint(data, date, format[key] ? format[key](value) : value);
        }
      });
    };

    const removePortPlot = (portId) => {
      Object.values(plotly).forEach(({ data }) => {
        const index = data.findIndex(({ id }) => id === portId);
        if (index >= 0) {
          data.splice(index, 1);
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

    watchEffect(() => Object.entries(sensors).forEach(([id, sensor]) => updatePlotly(id, sensor)));

    return {
      measurementIcon: icons,
      // Show graphs as default.
      showGraph: computed(() => props.customize?.sensor?.graph !== false),
      showLatest: computed(() => props.customize?.sensor?.latest),
      selectedDataPoints: computed(() => {
        const points = Object.keys(plotly);
        return props.paths?.length ? _.intersection(props.paths, points) : points;
      }),

      setWindow(graph, traces) {
        const stop = traces?.[0]?.['xaxis.range[1]'];
        if (stop && new Date(parseTimeString(stop)) < (graph.data?.[0]?.x || []).slice(-1)[0]) {
          graph.xWindow = 0; // eslint-disable-line no-param-reassign
        } else {
          graph.xWindow = 60; // eslint-disable-line no-param-reassign
        }
      },

      latestValue(key) {
        const data = _.get(plotly[key], 'data.0.y');
        const latest = data?.[data.length - 1];

        if (typeof latest !== 'number') {
          return '---';
        }
        if (key === 'motion') {
          // TODO: Write last movement.
          return latest ? i18next.t('Movement') : i18next.t('No movement');
        }
        if (key === 'airtvoc') {
          if (latest > 5000) {
            return i18next.t('Ventilate to improve air quality');
          }
          if (latest > 2000) {
            return i18next.t('Acceptable air quality');
          }
          if (latest > 1200) {
            return i18next.t('Decent air quality');
          }
          if (latest > 250) {
            return i18next.t('Good air quality');
          }
          return i18next.t('Excellent air quality');
        }
        if (key === 'airco2') {
          if (latest > 2200) {
            return i18next.t('Ventilate to improve air quality');
          }
          if (latest > 1500) {
            return i18next.t('Acceptable air quality');
          }
          if (latest > 1200) {
            return i18next.t('Decent air quality');
          }
          if (latest > 800) {
            return i18next.t('Good air quality');
          }
          return i18next.t('Excellent air quality');
        }

        const unit = i18next.t(`${key}Unit`);
        return `${Number.parseInt(latest, 10)} ${unit}`;
      },
    };
  },
};
</script>


<style scoped lang="less">
.chart {
  height: calc(var(--common-size) * 4);
}

.latest-grid {
  grid-template-columns: max-content max-content;
  justify-content: center;
  padding-right: calc(var(--field-size) * 0.5);
}
</style>
