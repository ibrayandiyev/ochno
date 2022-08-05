<template>
  <NumberControl
    :min="min"
    :max="max"
    :icon="icon"
    :slider="slider"
    :label="label"
    :vertical="vertical"
    :value="value"
    @input="publish"
  />
</template>


<script>
import _ from 'lodash';
import { ref, computed, watchEffect } from 'vue';

import NumberControl from '../NumberControl.vue';
import useIotPublish from '../../composables/useIotPublish';
import portsStore from '../../../modules/ports/store';

let paused = null;

export default {
  components: { NumberControl },

  props: {
    portIds: { type: Array, required: true },
    deviceType: { type: String, required: true }, // The device type, aka data key.

    prop: { type: String },
    props: { type: Array },

    min: { type: Number },
    max: { type: Number },
    icon: { type: String },
    slider: { type: String },
    label: { type: String },
    vertical: { type: Boolean },
  },

  setup(props) {
    const { publish } = useIotPublish({ ports: computed(() => Object.values(_.pick(portsStore.state.ports, props.portIds))) });

    const current = ref(0);

    const paths = computed(() => props.props || [props.prop]);
    const values = computed(() => Object.values(_.pick(portsStore.state[props.deviceType], props.portIds)));
    const deviceValue = computed(() => _.chain(values.value)
      .map((value) => Object.values(_.pick(value, paths.value)))
      .flatten()
      .mean()
      .value());

    const setCurrent = () => {
      current.value = deviceValue.value;
    };

    const debouncePause = _.debounce(() => {
      paused = null;
      setCurrent(); // Make sure to set value to device value, just in case it is not the same.
    }, 5000);

    const throttlePublish = _.throttle((value) => {
      const payload = paths.value.reduce((pay, path) => _.set(pay, path, value), {});
      publish({ [props.deviceType]: payload });
    }, 200);

    const pause = () => {
      if (paused && paused !== setCurrent) {
        // If a property was already paused, make sure to update it.
        paused();
      }
      paused = setCurrent;
      debouncePause();
    };

    watchEffect(() => {
      if (paused !== setCurrent) {
        setCurrent();
      }
    });

    return {
      pause,

      publish({ value }) {
        pause();
        throttlePublish(value);
      },
    };
  },
};
</script>
