<template>
  <div class="control-buttons control-width">
    <ControlPortSwitch v-for="portId in subtypes.portswitch" :key="portId" :port-id="portId" />
  </div>
</template>


<script>
import _ from 'lodash';
import { computed } from 'vue';

import ControlPortSwitch from './ControlPortSwitch.vue';
import portsStore from '../../../../../modules/ports/store';

const availableTypes = ['portswitch'];

export default {
  components: { ControlPortSwitch },

  props: {
    portIds: { type: Array, default: () => [] },
  },

  setup(props) {
    return {
      subtypes: computed(() => {
        const info = portsStore.state.info;
        const subtypes = {};

        props.portIds.forEach((portId) => {
          const type = _.intersection(info?.[portId]?.subtypes, availableTypes)[0];
          if (type) {
            if (subtypes[type]) {
              subtypes[type].push(portId);
            } else {
              subtypes[type] = [portId];
            }
          }
        });

        return subtypes;
      }),
    };
  },
};
</script>


<style scoped lang="less">
</style>
