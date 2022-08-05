<template>
  <div class="relative">
    <Spinner v-if="fetching" />

    <div class="analytics-wrapper m-end p-block">
      <h3>{{ $t('temperature') }} ({{ showIndividual ? '' : $t('Average') + ' ' }}<span class="font-no-case">{{ $t('temperatureUnit') }}</span>)</h3>
      <Chart v-bind="$_.get(timelines, 'temperature')" @relayout="relayout($event)" />

      <h4>{{ $t('span average', { precision: $t(precision) }) }}</h4>
      <Chart class="group-chart" v-bind="$_.get(bars, 'temperature')" />
    </div>

    <div v-for="key in $_.without(fields, 'temperature')" :key="key" class="analytics-wrapper m-end p-block">
      <el-tooltip placement="top" :content="$t(`${key}Tooltip`)">
        <h3>{{ $t(key) }} ({{ showIndividual ? '' : $t('Average') + ' ' }}<span class="font-no-case">{{ $t(`${key}Unit`) }}</span>)</h3>
      </el-tooltip>
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
const fields = ['temperature', 'airco2', 'airtvoc'];

export default {
  ...rest,

  setup(props) {
    let graph;

    const select = computed(() => {
      if (graph?.precision === '1d' || !props.showIndividual) {
        // We cannot use the mean values that are precalculated, since that would give the wrong mean value. So we recalculate :)
        return fields.map((field) => `SUM(sum_${field})/SUM(count_${field})${field === 'temperature' ? '/100' : ''},${field}`);
      }
      // Sum is used to be able to group. There should only be one value in the db per hour anyway (powerSense is an exception).
      return fields.map((field) => `SUM(mean_${field})${field === 'temperature' ? '/100' : ''},${field}`);
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
