<template>
  <div>
    <h2 class="margin-block-row">Charts</h2>

    <Chart :data="plotly.data" :layout="plotly.layout" :config="plotly.config" />
  </div>
</template>


<script>
import Chart from '../../components/Chart.vue';

export default {
  components: { Chart },

  setup() {
    const plotly = { // see created method.
      data: [
        { type: 'line', x: [], y: [] },
        { type: 'line', x: [], y: [] },
        // { type: 'line', x: [], y: [] },
        // { type: 'line', x: [], y: [] },
        // { type: 'line', x: [], y: [] },
        // { type: 'line', x: [], y: [] },
        // { type: 'line', x: [], y: [] },
        // { type: 'line', x: [], y: [] },
        // { type: 'line', x: [], y: [] },
        // { type: 'line', x: [], y: [] },
        // fill: 'tozeroy'
      ],
    };

    for (let i = 0; i < 20; i++) {
      plotly.data.forEach((plot) => {
        plot.x.push(i);
        plot.y.push(Math.random());
      });
    }

    return {
      plotly,
    };
  },
};
</script>


<style scoped lang="less">
</style>
