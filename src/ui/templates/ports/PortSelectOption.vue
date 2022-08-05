<template>
  <el-option v-if="portInfo" :label="portInfo.name" :value="portId" :disabled="disabled">
    <div class="auto-fr-grid">
      <Icon :type="portInfo.icon" default="port" class="font-smaller" />
      <div>{{ portInfo.name }}</div>
    </div>
  </el-option>
</template>


<script>
import { computed } from 'vue';

import portsStore from '../../../modules/ports/store';

export default {
  props: {
    portId: { type: String, required: true },
    disabled: { type: Boolean, default: false },
  },

  setup(props) {
    return {
      // NOTE: Checking in the template for this to actually exist, if it doesn't this option will not be shown at all.
      portInfo: computed(() => portsStore.state.info[props.portId]),
    };
  },
};
</script>


<style scoped lang="less">
.auto-fr-grid {
  padding-right: 2rem;
}
</style>
