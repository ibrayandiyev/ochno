import _ from 'lodash';
import { ref, computed, watch, watchEffect } from 'vue';

import Chart from '../../components/Chart.vue';
import { showError } from '../../utils/error';
import nanoTimestamp from '../../utils/nanoTimestamp';
import parseTimeString from '../../utils/parseTimeString';
import api from '../../../modules/metrics/api';

const timelineLayout = {
  showlegend: false,
  yaxis: {
    rangemode: 'tozero',
  },
};
const barLayout = {
  dragmode: false,
  showlegend: false,
  xaxis: {
    type: 'category', // Necessary to be able to switch between numbers and strings.
  },
  yaxis: {
    range: [0, 100],
  },
};
const barConfig = {
  scrollZoom: false,
};

const minInMs = 1000 * 60;
const hourCutoff = 0.03;

const barTypes = {
  '1d': {
    dateFunc(date) {
      return date.getDay() ? date.getDay() - 1 : 6; // NOTE: getDay return Sunday - Saturday (0 - 6).
    },
    xAxis: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  '1h': {
    dateFunc(date) {
      return date.getHours();
    },
    xAxis: _.range(0, 24),
  },
};


export const components = { Chart };

export const props = {
  spaceId: { type: String, required: true },
  portIds: { type: Array, default: () => [] },
  date: {
    type: Array,
    validator(value) {
      return value.length === 2 && value[0] instanceof Date && value[1] instanceof Date;
    },
  },
  showIndividual: { type: Boolean, default: false },
};

// Props also can include select, where and group. Which will then be used instead of the default ones.
export default function useGraph(properties, options) {
  const dateRange = ref(properties.date);
  const rawData = ref([]);
  const graphEl = ref(null);
  const fetching = ref(true);
  const precision = ref('1h');
  const timelines = ref({});
  const bars = ref({});

  const select = options.select || computed(() => {
    if (precision.value === '1d' || !properties.showIndividual) {
      return options.fields.map((field) => `SUM(sum_${field})/SUM(count_${field}),${field}`); // We cannot use the mean values that are precalculated, since that would give the wrong mean value. So we recalculate :)
    }
    return options.fields.map((field) => `SUM(mean_${field}),${field}`); // Sum is used to be able to group. There should only be one value in the db per hour anyway (powerSense is an exception).
  });

  const where = options.where || computed(() => '');

  const group = options.group || computed(() => (properties.showIndividual ? 'portId' : ''));

  const query = computed(() => {
    const [from, to] = dateRange.value;

    if (!from || !to) {
      return null;
    }

    const now = new Date();
    now.setHours(now.getHours() - 1);
    if (to > now) {
      to.setTime(now);
    }

    const quer = {
      spaceId: properties.spaceId,
      fields: select.value, // fields is basically the SELECT phrase
      where: _.compact([where.value, `time >= ${nanoTimestamp(from)} AND time < ${nanoTimestamp(to)}`]),
      group: _.compact([group.value, `time(${precision.value})`]),
    };

    if (properties.portIds.length) { // No port ids means entire space.
      quer.portId = properties.portIds;
    }

    return quer;
  });

  const layout = computed(() => {
    const hoverformat = precision.value === '1h' ? '%a %-d, %H:%M' : '%B, %a %-d';
    return _.merge({}, timelineLayout, { xaxis: { hoverformat } });
  });


  const graphTimeline = (grouped, field) => {
    const graph = Object.entries(grouped).map(([id, value]) => ({
      id,
      name: '',
      x: value.map(({ time }) => time),
      y: value.map((row) => row[field]),
    }));

    return { data: graph, layout: layout.value };
  };

  const graphBars = (grouped, field) => {
    const { dateFunc, xAxis } = barTypes[precision.value];

    const graph = Object.entries(grouped).map(([id, value]) => {
      // Calculate mean values per time span.
      let y = _.fill(Array(xAxis.length), 0);
      const counts = _.fill(Array(xAxis.length), 0);

      value.forEach((row) => {
        const time = dateFunc(row.time);
        const yValue = row[field];
        if (_.isFinite(yValue)) {
          y[time] += row[field];
        }
        counts[time] += 1;
      });

      y = y.map((sum, index) => sum / (counts[index] || 1)); // Avoid weird case of divide by zero.

      return { type: 'bar', id, name: '', x: xAxis, y };
    });

    return { data: graph, layout: barLayout, config: barConfig };
  };

  const graph = (data = rawData.value) => {
    if (data.length <= 0) {
      options.fields.forEach((field) => {
        // Set only dates if there is not data, this is to enable zooming dates.
        timelines.value[field] = { data: [{ x: dateRange.value, y: [null, null] }], layout: { yaxis: { range: [0, 100] } } };
        bars.value[field] = { data: [{ x: [], y: [] }], layout: barLayout, config: barConfig };
      });
    } else {
      options.fields.forEach((field) => {
        const groupedData = _.groupBy(data, group.value);
        timelines.value[field] = graphTimeline(groupedData, field);
        bars.value[field] = graphBars(groupedData, field);
      });
    }
  };

  const setPrecision = () => {
    const diagram = graphEl.value?.querySelector('.gridlayer');
    const width = diagram && diagram.getBBox().width;
    if (width) {
      const diff = dateRange.value[1] - dateRange.value[0]; // Subtracting dates give us a ms timestamp.
      const pxPerM = width / (diff / minInMs);
      if (pxPerM < hourCutoff) {
        precision.value = '1d';
      } else {
        precision.value = '1h';
      }
    }
  };

  const relayout = (traces) => {
    const range = traces && traces[0];
    if (range) {
      const start = range['xaxis.range[0]'];
      const stop = range['xaxis.range[1]'];
      if (start && stop) {
        dateRange.value = [new Date(parseTimeString(start)), new Date(parseTimeString(stop))];
        setPrecision();
      }
    }
  };

  let lastQueryId;

  const getData = async () => {
    if (!query.value) {
      return;
    }

    const queryId = Date.now();
    lastQueryId = queryId;
    fetching.value = true;

    try {
      const data = await api.get(options.measurement, query.value);

      if (graphEl.value) { // TODO: RESTRUCTURE: Does this unset when unmounted?
        return;
      }

      if (queryId !== lastQueryId) { // Check if this is still the most current query.
        return;
      }

      data.forEach((row) => {
        row.time = new Date(row.time); // eslint-disable-line no-param-reassign
      });
      rawData.value = data;
      graph();
    } catch (error) {
      showError(error);
    }

    // Check if this is the correct query. If not, make sure to use the current fetching value, since the current one could finish faster. Default: Set to false.
    fetching.value = (queryId !== lastQueryId && fetching.value) || false;
  };

  watchEffect(() => {
    dateRange.value = properties.date;
  });

  watch(
    () => query.value,
    () => getData(),
    { deep: true },
  );


  getData();

  return {
    ...properties,

    graphEl,
    fetching,
    precision,
    timelines,
    bars,

    relayout,
  };
}
