<template>
  <el-collapse-item :name="hubId" class="control-hub">
    <!-- Title -->
    <template #title>
      <div class="bg-transparent -circle" :style="spaceHub ? '' : 'visibility: hidden'"><Icon type="hub" /></div>
      <h3>
        <span>{{ spaceHub ? title(hubId) : $t('Removed hub') }}</span>
        <span v-if="hubName" style="opacity: 0.5"> - {{ hub && hub.hwId }}</span>
      </h3>
    </template>

    <!-- Content -->
    <template v-if="!hub">
      <AlertBar :text="$t('Item is no longer connected to this space')" class="m-down" />

      <div class="control-grid no-control-icon p-inline">
        <div>{{ $t('Remove from space') }}</div>
        <el-button class="-square -borderless" @click="removeHub(false)"><Icon type="bin" /></el-button>
      </div>
    </template>

    <template v-else>
      <div class="control-grid">
        <div class="label -circle"><Icon type="edit" /></div>
        <div>{{ $t('Name') }}</div>
        <Field v-model="hubName" :disabled="!hub" />

        <div class="label bg-transparent -circle"><Icon type="info" /></div>
        <div>{{ $t('Hardware id') }}</div>
        <div class="text-selectable text-right p-block-s">{{ hwId }}</div>

        <div class="label -circle"><Icon type="bin" /></div>
        <div>{{ $t('Remove from space') }}</div>
        <el-button class="-square -borderless" @click="removeHub(true)"><Icon type="bin" /></el-button>
      </div>

      <div class="p-block">
        <h4 class="text-center m-down">{{ $t('Hub settings') }} </h4>

        <div class="control-grid no-control-icon m-down p-block-s p-inline relative">
          <div v-if="setConfigError" class="contact-info absolute-cover">
            <span class="centered fill color-error">
              {{ $t('Unable to contact hub') }}
            </span>
          </div>
          <template v-else-if="!config">
            <div v-if="settingConfig" class="contact-info absolute-cover text-center">
              <Spinner class="inline" />
            </div>
          </template>
          <template v-else>
            <div>Auto switching</div>
            <el-switch :value="config.autoswitch" :disabled="disableConfig" @change="(value) => setConfig({ autoswitch: value })" />

            <div>USB Ethernet</div>
            <el-switch :value="config.usbethernet" :disabled="disableConfig" @change="(value) => setConfig({ usbethernet: value })" />

            <div>HDMI power control</div>
            <el-switch :value="config.hdmipowercontrol" :disabled="disableConfig" @change="(value) => setConfig({ hdmipowercontrol: value })" />

            <div>Bypass Edge</div>
            <el-switch :value="config.ggbypass" :disabled="disableConfig" @change="(value) => setConfig({ ggbypass: value })" />

            <div>Remote reboot</div>
            <el-button :disabled="rebooting" @click="rebootDevice">Reboot</el-button>
          </template>
        </div>

        <h4 class="text-center m-down">{{ $t('Update firmware') }} </h4>
        <div class="control-grid no-control-icon p-block-s p-inline">
          <div>Current version</div>
          <div class="text-selectable text-right p-block-s">{{ (hub && hub.fw) || $t('Unavailable') }}</div>

          <template v-if="fetchingFirmware">
            <div>
              <Spinner class="inline" />
            </div>
          </template>
          <template v-else>
            <div>{{ $t('Firmware versions') }}</div>
            <Field v-model="selected" type="select" filterable :allow-create="true" :disabled="!firmwares.length || disableFirmares">
              <template #options>
                <el-option v-for="version in firmwares" :key="version" :label="version" :value="version" />
              </template>
            </Field>

            <div />
            <div v-if="updatingFirmware" class="text-right">
              <Spinner class="inline" />
            </div>
            <div v-else-if="updateFirmwareError" class="text-right">{{ updateFirmwareError }}</div>
            <el-button v-else :disabled="disableFirmares || !selected" @click="updateDevice(selected)">Update firmware</el-button>
            <div v-if="updateFirmwareMessage" class="text-right">{{ updateFirmwareMessage }}</div>
          </template>
        </div>
      </div>
    </template>
  </el-collapse-item>
</template>


<script>
import { ElMessageBox } from 'element-plus';
import i18next from 'i18next';
import _ from 'lodash';
import { ref, computed, watchEffect } from 'vue';

import useHub from '../useHub';
import AlertBar from '../../../components/AlertBar.vue';
import useSave from '../../../composables/useSave';
import hubsStore from '../../../../modules/hubs/store';
import spacesStore from '../../../../modules/spaces/store';
import workspaceStore from '../../../../modules/workspace/store';

export default {
  components: { AlertBar },

  props: {
    hubId: { type: String, required: true },
    space: { type: Object, required: true },
  },

  setup(props) {
    const selected = ref(null);

    const save = useSave({ actual: computed(() => props.space), store: spacesStore });
    const hub = useHub({ id: props.hubId });
    const saveHub = useSave({ actual: hub.hub, store: hubsStore });

    const spaceHub = computed(() => save.item?.items?.find((item) => item.id === props.hubId));

    watchEffect(() => {
      if (selected.value) {
        hub.updateFirmwareError = '';
      }
    });

    return {
      ...hub,

      selected,
      spaceHub,
      title: hubsStore.getters.title,

      hubName: computed({
        get: () => hub.hub.value?.name,
        set: (value) => {
          if (saveHub.item) {
            saveHub.item.name = value;
            saveHub.saveItem();
          }
        },
      }),

      async updateDevice() {
        try {
          await ElMessageBox.confirm(
            `${i18next.t('The hub will be updated as soon as possible. During the update the hub will be unavailable and restarted. Is this ok?')},
            <br />
            <br />
            <div class="auto-fr-grid">
              <div>${i18next.t('Selected version')}</div>
              <div class="bold">${selected.value}</div>
            </div>`,
            i18next.t('Queue update'),
            {
              dangerouslyUseHTMLString: true,
              cancelButtonText: i18next.t('Cancel'),
              confirmButtonText: i18next.t('Yes'),
            },
          );
          await hub.updateFirmware(selected.value);
          selected.value = '';
        } catch (error) {
          // Catching cancel
        }
      },

      async rebootDevice() {
        try {
          await ElMessageBox.confirm(
            i18next.t('The hub will be unavailable during reboot. Is this ok?'),
            i18next.t('Reboot hub'),
            {
              cancelButtonText: i18next.t('Cancel'),
              confirmButtonText: i18next.t('Yes'),
            },
          );
          await hub.reboot();
        } catch (error) {
          // Catching cancel
        }
      },

      async removeHub(confirm) {
        const index = _.findIndex(save.item?.items, (item) => item.id === props.hubId);
        if (index >= 0) {
          if (confirm) {
            try {
              await ElMessageBox.confirm(
                i18next.t('Removing a hub will also remove all of its ports from the space and automation. Is this ok?'),
                i18next.t('Remove hub'),
                {
                  cancelButtonText: i18next.t('Cancel'),
                  confirmButtonText: i18next.t('Yes'),
                },
              );
            } catch (error) {
              // Catching cancel
              return;
            }
          }

          workspaceStore.dispatch.unselect({ itemIds: props.hubId });
          save.item.items.splice(index, 1);
          save.saveItem();
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.control-hub:deep(.el-collapse-item__header) {
  padding-left: 0;
}

.control-hub:deep(.el-collapse-item__content) {
  max-width: var(--max-width-controls);
  margin: 0 auto;
  padding: var(--column-gap) 0 var(--row-gap);
}

.contact-info {
  margin: -1rem;

  .color-error {
    background-color: rgba(var(--color-black), var(--opacity-heavy));
  }
}

.pad-left {
  padding-left: calc(var(--field-size) + var(--column-gap));
}
</style>
