<template>
  <div class="control-hubs">
    <ControlHeader device-type="hub">
      <h3>{{ $t('Hubs') }}</h3>
    </ControlHeader>

    <el-collapse :value="hubIds.length === 1 ? [hubIds[0]] : expanded" class="control-width" @input="collapse">
      <ControlHub v-for="hubId in hubIds" :key="hubId" :hub-id="hubId" :space="space" />
    </el-collapse>
  </div>
</template>


<script>
import { ref } from 'vue';

import ControlHub from './ControlHub.vue';
import ControlHeader from '../../../components/controls/ControlHeader.vue';

export default {
  components: { ControlHeader, ControlHub },

  props: {
    hubIds: { type: Array, default: () => [] },
    space: { type: Object, required: true },
  },

  setup(props) {
    const expanded = ref([]);

    return {
      expanded,

      collapse(value) {
        if (props.hubIds.length !== 1) {
          expanded.value = value;
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
</style>
