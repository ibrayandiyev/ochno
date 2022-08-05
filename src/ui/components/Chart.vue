<template>
  <div ref="elChart" v-resize.debounce="resize" class="chart" />
</template>


<script>
import _ from 'lodash';
// Plotly github: https://github.com/plotly/plotly.js
// Plotly docs: https://plot.ly/javascript/plotlyjs-function-reference/
// This file is inspired by: https://github.com/statnett/vue-plotly/blob/master/src/Plotly.vue
import Plotly from 'plotly.js/lib/core'; // NOTE: This is the core of plotly and it only includes the scatter graph, if more is needed, see github page.
import PlotlyBar from 'plotly.js/lib/bar'; // Include bar graph as well.
import { ref, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue';

Plotly.register(PlotlyBar);

// See https://plot.ly/javascript/plotlyjs-events/
const events = ['click', 'doubleclick', 'hover', 'unhover', 'restyle', 'relayout', 'relayouting'];

const colorway = ['rgb(244,152,25)', 'rgb(33,171,188)', 'rgb(252,196,14)', 'rgb(10,107,139)', 'rgb(229,111,11)', 'rgb(40,232,255)', 'rgb(255,220,7)', 'rgb(5,82,109)', 'rgb(202,80,2)', 'rgb(125,255,255)'];

const defaultLayout = {
  colorway,
  dragmode: 'pan',
  margin: { l: 50, r: 30, b: 50, t: 20, pad: 4 },
  yaxis: {
    fixedrange: true,
  },
};

const defaultConfig = {
  displayModeBar: false,
  responsive: true,
  scrollZoom: true,
};

export default {
  props: {
    data: { type: Array, default: () => [] },
    layout: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
    xWindow: { type: Number },
  },

  emits: [...events],

  setup(props, { emit }) {
    let colorMap = {};
    let datarevision = 0;
    let mergedLayout = {};
    let mergedConfig = {};

    const elChart = ref(null);

    const setupEvents = () => {
      if (elChart.value) {
        events.forEach((name) => elChart.value.on(`plotly_${name}`, (...args) => emit(name, args)));
      }
    };

    const setDataColor = () => {
      const dataColors = props.data.map(({ id }) => id && colorMap[id]);
      const currentColors = mergedLayout.colorway;
      if (!_.isEqual(dataColors, currentColors)) {
        const newColorMap = {};
        let remainingColors = _.without(colorway, ...dataColors);

        mergedLayout.colorway = props.data.map(({ id }) => {
          if (!remainingColors.length) {
            remainingColors = colorway.slice();
          }

          const color = colorMap[id] || remainingColors.shift();
          if (id) {
            newColorMap[id] = color;
          }
          return color;
        });

        colorMap = newColorMap; // Replace this to get rid of ids that are no longer in the map.
      }
    };

    const setWindow = () => {
      if (props.xWindow) {
        Plotly.relayout(elChart.value, { 'xaxis.range': [props.data[0].x.slice(-props.xWindow)[0], props.data[0].x.slice(-1)[0]] });
      }
    };

    const newPlot = () => {
      if (elChart.value) {
        setDataColor();
        Plotly.newPlot(elChart.value, props.data, mergedLayout, mergedConfig);
        setWindow();
        setupEvents();
      }
    };

    const update = () => {
      if (elChart.value) {
        setDataColor();
        datarevision += 1; // Need to make a new datarevision since our data object probably is the same.
        Plotly.react(elChart.value, props.data, _.merge(mergedLayout, { datarevision }), mergedConfig);
        setWindow();
      }
    };

    const debouncedUpdate = _.debounce(update, 100); // Use debounced update since user might update data, layout and config at the same time.

    const resize = (el) => {
      // NOTE: Plotly.js "resonsive" config doesn't work for most of our use cases, since it only applies when the window changes size.
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width && height) {
        Plotly.relayout(el, { width, height });
      }
    };

    watch(
      () => props.data,
      () => debouncedUpdate(),
      { deep: true },
    );

    watchEffect(() => {
      // Need to merge with previous value since Plotly sets some value to it.
      mergedLayout = _.merge(mergedLayout, defaultLayout, props.layout);
      debouncedUpdate();
    });

    watchEffect(() => {
      // Need to merge with previous value since Plotly sets some value to it.
      mergedConfig = _.merge(mergedConfig, defaultConfig, props.config);
      debouncedUpdate();
    });

    onMounted(() => newPlot());
    onBeforeUnmount(() => Plotly.purge(elChart.value));

    return {
      elChart,

      resize,
    };
  },
};
</script>


<style scoped lang="less">
.chart:deep(.plot-container) {
  .main-svg {
    background: transparent !important;

    &:last-child { // tooltips
      overflow: visible;
    }
  }

  .bglayer .bg,
  .legend .bg {
    fill: transparent !important;
  }

  .xgrid,
  .ygrid {
    stroke: var(--rgba-field-divider) !important;
  }

  text {
    font: inherit !important;
  }

  .cartesianlayer text,
  .axistext text,
  .legendtext {
    fill: var(--rgba-font-transparent) !important;
  }

  .axistext path,
  .hovertext path {
    stroke-width: 0 !important;
  }

  .axistext path {
    fill: rgb(var(--color-black)) !important;
    padding: 5px;
  }

  .hovertext rect {
    fill: rgb(var(--color-black)) !important;
  }
}
</style>
