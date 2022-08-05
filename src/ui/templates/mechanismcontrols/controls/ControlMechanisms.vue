<template>
  <div class="control-mechanisms">
    <ControlMechanismBuilder v-for="id in filteredControlIds" :key="id" :mechanism-control-id="id" :mechanism-ids="filteredMechanismIds" />
    <Spinner v-if="mechanismControlsFetching || mechanismsFetching" />
  </div>
</template>


<script>
import { computed } from 'vue';

import ControlMechanismBuilder from './ControlMechanismBuilder.vue';
import useFetchers from '../../../composables/useFetchers';
import mechanismControlsStore from '../../../../modules/mechanismcontrols/store';
import mechanismsStore from '../../../../modules/mechanisms/store';

const mapId = ({ id }) => id;

export default {
  components: { ControlMechanismBuilder },

  props: {
    spaceId: { type: String },
    mechanismIds: { type: Array },
  },

  setup(props) {
    const { filtered } = mechanismControlsStore.getters;

    const filteredMechanismIds = computed(() => {
      if (props.mechanismIds?.length) {
        return Object.values(this.mechanisms).filter(({ id }) => props.mechanismIds.indexOf(id) >= 0).map(mapId);
      }
      if (props.spaceId) {
        return Object.values(this.mechanisms).filter(({ spaceId }) => spaceId === props.spaceId).map(mapId);
      }
      return [];
    });

    const filteredControlIds = computed(() => filtered.value({ spaceIds: [props.spaceId], mechanismIds: this.filteredMechanismIds }).map(mapId));

    const mechanismsParams = computed(() => {
      const params = {};
      if (props.mechanismIds && props.mechanismIds.length) {
        params.id = props.mechanismIds;
      } else if (props.spaceId) {
        params.spaceId = props.spaceId;
      }
      return params;
    });

    const controlsParams = computed(() => {
      const params = {};
      if (filteredMechanismIds.value) {
        params.mechanismIds = filteredMechanismIds.value;
      }
      if (props.spaceId) {
        params.spaceIds = [props.spaceId];
      }
      return params;
    });

    const { fetching } = useFetchers([
      { store: mechanismsStore, params: () => mechanismsParams.value, trigger: computed(() => Object.keys(mechanismsParams).length) },
      { store: mechanismControlsStore, params: () => controlsParams.value, trigger: computed(() => Object.keys(controlsParams).length) },
    ]);

    return {
      filteredMechanismIds,
      filteredControlIds,

      fetching,
    };
  },
};
</script>

<style scoped lang="less">
</style>
