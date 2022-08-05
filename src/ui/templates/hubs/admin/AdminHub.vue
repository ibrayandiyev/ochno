<template>
  <Pane @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="hub" />
    </template>

    <template #title>
      <span>Hub: {{ title }}</span>
    </template>

    <template #tool>
      <el-button v-if="!creating && canRemove" class="-square -common-height -borderless" @click="remove">
        <Icon type="bin" />
      </el-button>
    </template>

    <div>
      <Spinner v-if="fetching" />

      <div class="admin-single-grid grid">
        <div>
          <h4 class="admin-header">Details</h4>

          <div class="control-grid no-control-icon">
            <label>Hub hardware id</label>
            <Field v-bind="generateProps('hwId')" :disabled="!creating" v-on="generateEvents('hwId')" />

            <label>Hub name</label>
            <Field v-bind="generateProps('name')" v-on="generateEvents('name')" />

            <label>Account</label>
            <Field type="select" filterable v-bind="generateProps('accountId')" v-on="generateEvents('accountId')">
              <template #options>
                <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
              </template>
            </Field>

            <div v-if="creating" class="m-up text-center">
              <el-button :disabled="isSubmitting" @click="create">Create hub</el-button>
            </div>
          </div>
        </div>

        <div v-if="!creating">
          <h4 class="admin-header">Information</h4>
          <div class="control-grid no-control-icon">
            <template v-if="updateDisabled">
              <div class="column-span-2 text-center color-error">
                <Spinner v-if="settingConfig" class="inline" />
                <span v-else-if="setConfigError">
                  Error fetching hub config: {{ setConfigError }}
                </span>
              </div>

              <template v-if="config">
                <div>Auto switching</div>
                <el-switch :value="config.autoswitch" :disabled="disableConfig" @change="(value) => setConfig({ autoswitch: value })" />

                <div>USB Ethernet</div>
                <el-switch :value="config.usbethernet" :disabled="disableConfig" @change="(value) => setConfig({ usbethernet: value })" />

                <div>HDMI power control</div>
                <el-switch :value="config.hdmipowercontrol" :disabled="disableConfig" @change="(value) => setConfig({ hdmipowercontrol: value })" />

                <div>GG bypass</div>
                <el-switch :value="config.ggbypass" :disabled="disableConfig" @change="(value) => setConfig({ ggbypass: value })" />
              </template>

              <div>Update firmware</div>
              <template v-if="fetchingFirmware">
                <div class="relative">
                  <Spinner class="inline" />
                </div>
              </template>
              <template v-else>
                <Field v-model="selected" type="select" filterable :allow-create="true" :disabled="!firmwares.length || disableFirmares">
                  <template #options>
                    <el-option v-for="version in firmwares" :key="version" :label="version" :value="version" />
                  </template>
                  Firmware versions
                </Field>

                <div />
                <div v-if="updatingFirmware" class="text-right relative">
                  <Spinner class="inline" />
                </div>
                <div v-else-if="updateFirmwareError" class="text-right">{{ updateFirmwareError }}</div>
                <el-button v-else :disabled="disableFirmares || !selected" @click="updateFirmware(selected)">Update firmware</el-button>
                <div v-if="updateFirmwareMessage" class="text-right">{{ updateFirmwareMessage }}</div>
              </template>

              <div>Remote reboot</div>
              <el-button :disabled="rebooting" @click="reboot">Reboot</el-button>

              <div>MQTT</div>
              <div style="word-break: break-all;">sys/+/{{ hub.hwId }}/#</div>
            </template>
            <template v-else>
              Hub does not support online management.
            </template>
          </div>
        </div>
      </div>

      <div v-if="!creating" class="admin-blob">
        <h4 class="admin-header">Data blob</h4>
        <JSONEditor
          :json="actual || {}"
          :disabled="!canRemove"
          button-text="Save JSON"
          @save="saveFull"
        />
      </div>

      <div v-if="!creating" class="admin-single-grid grid">
        <Spinner v-if="fetchingLogs" class="inline" />
        <div v-else-if="!logs">
          <h4 class="admin-header">Sys logs</h4>
          <div class="color-error text-center">No logs available</div>
        </div>
        <template v-else>
          <div>
            <h4 class="admin-header">Sys cert</h4>
            <JSONEditor :json="logs.cert" :disabled="true" />
          </div>

          <div>
            <h4 class="admin-header">Sys init</h4>
            <JSONEditor :json="logs.init" :disabled="true" />
          </div>

          <div>
            <h4 class="admin-header">Sys logs</h4>
            <JSONEditor :json="logs.log" :disabled="true" />
          </div>
        </template>
      </div>
    </div>
  </Pane>
</template>


<script>
import { ref, computed, watchEffect } from 'vue';

import useHub from '../useHub';
import useItem, * as rest from '../../../components/admin/useItem';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/hubs/store';
import accountsStore from '../../../../modules/accounts/store';

export default {
  ...rest,

  setup(props, context) {
    const selected = ref(null);

    const id = computed(() => props.id);

    const hub = useHub({ id });
    const item = useItem({ id, store }, context);
    const fetchers = useFetchers(item.creating.value ? [] : [ // fetching, fetchAll
      { store, action: 'getOne', params: () => ({ id: id.value }) },
      { store: accountsStore },
    ]);

    watchEffect(() => {
      if (selected.value) {
        hub.updateFirmwareError = '';
      }
    });

    return {
      ...hub,
      ...item,
      ...fetchers,

      emit: context.emit,

      selected,
      accounts: accountsStore.state.accounts,
    };
  },
};
</script>
