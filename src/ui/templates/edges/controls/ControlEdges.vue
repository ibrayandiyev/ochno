<template>
  <div class="control-hubs">
    <ControlHeader device-type="edge">
      <h3>{{ $t('Edges') }}</h3>
    </ControlHeader>

    <el-collapse :value="edgeIds.length === 1 ? [edgeIds[0]] : expanded" class="control-width" @input="collapse">
      <ControlEdge v-for="edgeId in edgeIds" :key="edgeId" :edge-id="edgeId" :space="space" />
    </el-collapse>
  </div>
</template>


<script>
import { ref } from 'vue';

import ControlEdge from './ControlEdge.vue';
import ControlHeader from '../../../components/controls/ControlHeader.vue';

export default {
  components: { ControlHeader, ControlEdge },

  props: {
    edgeIds: { type: Array, default: () => [] },
    space: { type: Object, required: true },
  },

  setup(props) {
    const expanded = ref([]);

    return {
      expanded,

      collapse(value) {
        if (props.edgeIds.length !== 1) {
          expanded.value = value;
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
</style>
