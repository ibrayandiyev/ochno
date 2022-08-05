<template>
  <div class="control-port-switch">
    <ControlHeader :port-ids="[portId]" device-type="portswitch" :text="$t('Port Switch')" />

    <div v-for="hubPort in hubPorts" :key="hubPort.id">
      <el-checkbox :model-value="hubPort.id === activePort" class="-square font-big1" @input="clicked(hubPort.id)">
        <div class="auto-fr-grid">
          <Icon :type="portInfo && portInfo.icon" prefix="device" default="port" />
          <h3>{{ portInfo && portInfo.name }}</h3>
        </div>
      </el-checkbox>
    </div>
  </div>
</template>


<script>
import _ from 'lodash';
import { computed } from 'vue';

import ControlHeader from '../../../../components/controls/ControlHeader.vue';
import useIotPublish from '../../../../composables/useIotPublish';
import portsStore from '../../../../../modules/ports/store';

export default {
  components: { ControlHeader },

  props: {
    portId: { type: String },
  },

  setup(props) {
    const { filtered } = portsStore.getters;

    const { publish } = useIotPublish();

    const port = computed(() => portsStore.state.ports[props.portId]);
    const portInfo = computed(() => portsStore.state.info[props.portId]);
    const activePort = computed(() => {
      const button = portsStore.state.button?.[props.portId];
      // NOTE: "pushed" property is deprecated and has been removed in newer versions of the port switch, but for now it needs to still be supported since that firmware exists.
      return (button?.pushed !== false) && button?.activeport;
    });

    return {
      portInfo,
      activePort,

      // The usb-c ports that are related to this button.
      hubPorts: computed(() => {
        if (port.value) {
          return _.chain(filtered.value({ hubIds: [port.value.hubId] }))
            .filter({ hwType: 'usb-c' }) // Only interested in the usb-c ports.
            .reject({ id: port.value.id }) // Do not include self.
            .sortBy('hwId') // This will hopefully give the same "order" as the buttons themself.
            .value();
        }
        return [];
      }),

      clicked(portId) {
        const activeport = portId === activePort.value ? '' : portId;
        publish(
          { button: { activeport, pushed: !!activeport } },
          { ports: port.value, optimistic: true },
        );
      },
    };
  },
};
</script>


<style scoped lang="less">
.control-header {
  margin-bottom: calc(var(--column-gap) * -1);
}
</style>
