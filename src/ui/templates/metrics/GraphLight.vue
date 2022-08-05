<template>
  <div class="relative">
    <Spinner v-if="fetching" />

    <div v-for="key in fields" :key="key" class="analytics-wrapper m-end p-block">
      <h3>{{ $t(key) }} ({{ showIndividual ? '' : $t('Average') + ' ' }}<span class="font-no-case">{{ $t(`${key}Unit`) }}</span>)</h3>
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
const fields = ['luminosity', 'lighttemperature'];

export default {
  ...rest,

  setup(props) {
    const graph = useGraph(props, {
      measurement,
      fields,
      where: computed(() => 'mean_luminosity > 0'), // Filter out values that are too unpredictable
    });

    return {
      ...graph,

      fields,
    };
  },
};
</script>
