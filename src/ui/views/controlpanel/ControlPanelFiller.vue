<template>
  <div v-responsive="{ 'no-control-number': el => el.width <= 350, 'no-control-label': el => el.width <= 250 }" class="content bg-gray-1">
    <Scrollbar>
      <div>
        <Spinner v-if="portsFetching" />
        <ControlSchemeBuilder
          :controls="controls"
          :control-scheme-id="controlSchemeId"
          :mechanism-ids="mechanismIds"
          :port-ids="calculatedPortIds"
          :space-id="spaceId"
        />
      </div>
    </Scrollbar>
  </div>
</template>


<script>
import { computed } from 'vue';

import ControlSchemeBuilder from './ControlSchemeBuilder.vue';
import useFetchers from '../../composables/useFetchers';
import hubsStore from '../../../modules/hubs/store';
import portsStore from '../../../modules/ports/store';
import workspaceStore from '../../../modules/workspace/store';

export default {
  components: { ControlSchemeBuilder },

  props: {
    controlSchemeId: { type: String },
    spaceId: { type: String, required: true },
    mechanismIds: { type: Array },
    hubIds: { type: Array },
    hwIds: { type: Array },
    portIds: { type: Array },
    controls: { type: Array },
  },

  setup(props) {
    const calculatedHubIds = computed(() => {
      if (props.hubIds?.length) {
        return props.hubIds;
      }

      if (props.hwIds?.length) {
        return Object.values(hubsStore.state.hubs).filter(({ hwId }) => props.hwIds.indexOf(hwId) >= 0).map(({ id }) => id);
      }
      return [];
    });

    const calculatedPortIds = computed(() => {
      if (props.portIds) {
        return props.portIds;
      }

      if (calculatedHubIds.value.length) {
        return Object.values(portsStore.state.ports).filter(({ hubId }) => calculatedHubIds.value.indexOf(hubId) >= 0).map(({ id }) => id);
      }

      return workspaceStore.getters.portIds.value;
    });

    const portsParams = computed(() => {
      if (props.portIds || !calculatedHubIds.value.length) {
        return { id: calculatedPortIds.value };
      }

      return { hubId: calculatedHubIds.value };
    });

    useFetchers([
      { store: hubsStore, params: () => ({ id: props.hubIds }), trigger: computed(() => props.hubIds?.length) },
      { store: portsStore, params: () => portsParams.value, trigger: portsParams },
    ]);

    return {
      calculatedPortIds,

      portsFetching: computed(() => portsStore.state.fetching),
    };
  },
};
</script>


<style scoped lang="less">
.header {
  width: 100%;
  color: rgb(var(--color-gray-5));
}

.content {
  height: ~'calc(100% - var(--common-size))';
}
</style>
