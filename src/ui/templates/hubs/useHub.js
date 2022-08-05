import { ref, unref, computed, watch } from 'vue';

import { showError } from '../../utils/error';
import store from '../../../modules/hubs/store';
import { productUpdate, productPrefix } from '../../../modules/hubs/product';

export default ({ id }) => {
  const hub = computed(() => store.state.hubs[unref(id)]);
  const hwId = computed(() => hub.value?.hwId);
  const updateCode = computed(() => productUpdate[productPrefix(hwId.value)]);
  const updateDisabled = computed(() => hwId.value && !hwId.value.startsWith('ph'));

  const settingConfig = ref(false);
  const setConfigError = ref('');
  const setConfig = async (newConfig = {}) => {
    if (hub.value) {
      settingConfig.value = true;
      setConfigError.value = '';
      try {
        await store.dispatch.putConfig(hub.value.id, newConfig);
      } catch (error) {
        setConfigError.value = error?.response?.data?.message || error?.message;
      }
      settingConfig.value = false;
    }
  };

  const fetchingLogs = ref(false);
  const fetchLogs = async () => {
    if (hwId.value) {
      fetchingLogs.value = true;
      try {
        await store.dispatch.getLogs(hwId.value);
      } catch (error) {
        showError(error);
      }
      fetchingLogs.value = false;
    }
  };

  const fetchingFirmware = ref(false);
  const fetchFirmware = async () => {
    if (updateDisabled.value) {
      fetchingFirmware.value = true;
      try {
        await store.dispatch.getFirmware(hub.value.id);
      } catch (error) {
        // Do nothing, it is done elsewhere.
      }
      fetchingFirmware.value = false;
    }
  };

  const updatingFirmware = ref(false);
  const updateFirmwareMessage = ref('');
  const updateFirmwareError = ref('');
  const updateFirmware = async (newVersion) => {
    if (hub.value && newVersion) {
      updatingFirmware.value = true;
      updateFirmwareMessage.value = '';
      updateFirmwareError.value = '';
      try {
        updateFirmwareMessage.value = await store.dispatch.putFirmware(hub.value.id, newVersion);
      } catch (error) {
        updateFirmwareError.value = error.message;
      }
      updatingFirmware.value = false;
    }
  };

  const rebooting = ref(false);
  const reboot = async () => {
    if (hub.value) {
      rebooting.value = true;
      try {
        await store.dispatch.putReboot(hub.value.id);
      } catch (error) {
        showError(error);
      }
      rebooting.value = false;
    }
  };

  watch(
    () => hwId.value,
    () => fetchLogs(),
    { immediate: true },
  );

  watch(
    () => hub.value?.id,
    () => setConfig(),
    { immediate: true },
  );

  watch(
    () => updateCode.value,
    () => !store.state.firmwares[updateCode.value] && fetchFirmware(),
    { immediate: true },
  );

  return {
    hub,
    hwId,

    config: computed(() => store.state.configs[hub.value?.id]),
    disableConfig: computed(() => settingConfig.value || !!setConfigError.value || rebooting.value),
    settingConfig,
    setConfigError,
    setConfig,
    getConfig: () => setConfig(),

    logs: computed(() => store.state.logs[hub.value?.id]),
    fetchingLogs,
    fetchLogs,

    firmwares: computed(() => store.state.firmwares[updateCode.value]),
    disableFirmares: computed(() => fetchingFirmware.value || updatingFirmware.value),
    fetchingFirmware,
    fetchFirmware,

    updateDisabled,
    updatingFirmware,
    updateFirmwareMessage,
    updateFirmwareError,
    updateFirmware,

    rebooting,
    reboot,
  };
};
