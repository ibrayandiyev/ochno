<template>
  <div class="relative">
    <Spinner v-if="fetching" />

    <div v-for="key in fields" :key="key" class="analytics-wrapper m-end p-block">
      <h3>{{ $t(key) }} ({{ showIndividual ? '' : $t('Average') + ' ' }}%)</h3>
      <Chart v-bind="$_.get(timelines, key)" @relayout="relayout($event)" />

      <h4>{{ $t('span average', { precision: $t(precision) }) }}</h4>
      <Chart class="group-chart" v-bind="$_.get(bars, key)" />
    </div>
  </div>
</template>


<script>
import { computed } from 'vue';

import useGraph, * as rest from './useGraph';

const measurement = 'sensor_h';
const fields = ['motion'];

export default {
  ...rest,

  setup(props) {
    let graph;

    const select = computed(() => {
      if (graph?.precision === '1d' || !props.showIndividual) {
        return ['(SUM(sum_motion)/SUM(count_motion))*100,motion'];
      }
      return ['SUM(mean_motion)*100,motion'];
    });

    graph = useGraph(props, {
      measurement,
      fields,
      select,
    });

    return {
      ...graph,

      fields,
    };
  },
};
</script>
