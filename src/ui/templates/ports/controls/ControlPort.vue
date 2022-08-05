<template>
  <el-collapse-item :name="portId" class="control-port">
    <template #title>
      <Icon :port-id="portId" prefix="device" default="port" class="font-big2" :style="portInfo ? '' : 'visibility: hidden'" />
      <h3>{{ portInfo ? portInfo.name : $t('Removed port') }}</h3>
    </template>

    <template v-if="!portInfo">
      <AlertBar :text="$t('Item is no longer connected to this space')" class="m-down" />

      <div class="control-grid no-control-label">
        <div>{{ $t('Remove from space') }}</div>
        <el-button class="-square -borderless" @click="removePort"><Icon type="bin" /></el-button>
      </div>
    </template>

    <template v-else>
      <template v-if="!portInfo.online">
        <AlertBar :text="$t('Connection lost')" class="m-down" />
      </template>

      <ControlDeviceImage :port-id="portId" />

      <div class="control-grid no-control-label">
        <div class="-circle"><Icon type="vision" /></div>
        <div class="flex-space-between">
          <div class="label">{{ $t('Hide from space') }}</div>
          <el-switch v-model="portHidden" class="text-right" />
        </div>
      </div>

      <div class="control-grid no-control-label">
        <div class="-circle"><Icon type="power" /></div>
        <div class="flex-space-between">
          <div class="label">{{ $t('Enabled') }}</div>
          <el-switch v-model="portEnabled" class="text-right" />
        </div>
      </div>

      <el-collapse v-model="expanded" :accordion="true" class="pad-left -minimal">
        <el-collapse-item name="info" class="bg-gray-4">
          <template #title>
            <span>{{ $t('Details') }}</span>
          </template>

          <div>
            <div class="auto-fr-grid" style="word-break: break-word">
              <div>{{ $t('Hub') }}</div>
              <div class="text-selectable text-right">{{ hubTitle(port && port.hubId) }}</div>

              <div>{{ $t('Port id') }}</div>
              <div class="text-selectable text-right">{{ portId }}</div>

              <div>{{ $t('Last update') }}</div>
              <div v-if="expanded" class="text-right">{{ latest && new Date(latest).toLocaleString() }}</div>
            </div>

            <JSONEditor v-if="expanded" :json="fullPort(portId) || {}" :disabled="true" class="fill" />
          </div>
        </el-collapse-item>
      </el-collapse>
    </template>
  </el-collapse-item>
</template>

<script>
import _ from 'lodash';
import { ref, computed } from 'vue';

import ControlDeviceImage from '../../../components/controls/ControlDeviceImage.vue';
import AlertBar from '../../../components/AlertBar.vue';
import JSONEditor from '../../../components/JSONEditor.vue';
import useSave from '../../../composables/useSave';
import useIotPublish from '../../../composables/useIotPublish';
import hubsStore from '../../../../modules/hubs/store';
import portsStore from '../../../../modules/ports/store';
import spacesStore from '../../../../modules/spaces/store';
import workspaceStore from '../../../../modules/workspace/store';

export default {
  components: { ControlDeviceImage, AlertBar, JSONEditor },

  props: {
    portId: { type: String, required: true },
    space: { type: Object, required: true },
  },

  setup(props) {
    const save = useSave({ actual: computed(() => props.space), store: spacesStore });
    const { publishValue } = useIotPublish();

    const port = computed(() => portsStore.state.ports[props.portId]);
    const portInfo = computed(() => portsStore.state.info[props.portId]);
    const spacePort = computed(() => save.item?.items?.find((item) => item.id === props.portId));

    return {
      expanded: ref(''),

      port,
      portInfo,
      hubTitle: hubsStore.getters.title,
      fullPort: portsStore.getters.full,
      latest: computed(() => portsStore.state.latest[props.portId]),

      portEnabled: computed({
        get: () => portsStore.state.data?.[props.portId]?.enabled !== false,
        set: (value) => publishValue('enabled', value, { ports: port.value, optimistic: true }),
      }),

      portHidden: computed({
        get: () => spacePort.value?.hidden,
        set: (value) => {
          if (spacePort.value) {
            spacePort.value.hidden = value;
            save.saveItem();
          }
        },
      }),

      removePort() {
        const index = _.findIndex(save.item?.items, (item) => item.id === props.portId);
        if (index >= 0) {
          workspaceStore.dispatch.unselect({ itemIds: props.portId });
          save.item.items.splice(index, 1);
          save.saveItem(); // TODO: Could we change this to only update the port of the floorplan, not the entire thing?
        }
      },
    };
  },
};
</script>

<style scoped lang="less">
.pad-left {
  padding-left: calc(var(--field-size) + var(--column-gap));
}

.control-port:deep(.el-collapse-item__header) {
  padding-left: 0;
}

.control-port:deep(.el-collapse-item__content) {
  max-width: var(--max-width-controls);
  margin: 0 auto;
  padding: var(--column-gap) 0 var(--row-gap);
}

// RESPONSIVE STATES
// classes are set in parent to this component.
.no-control-label {
  .pad-left {
    padding-left: 0;
  }
}
</style>
