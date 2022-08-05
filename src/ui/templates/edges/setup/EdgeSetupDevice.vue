<template>
  <div>
    <h2 class="m-down">{{ $t('Connected Edge device') }}</h2>

    <div class="grid">
      <div>{{ $t('Edge version') }}</div>
      <div>{{ version }}</div>
    </div>


    <h4 class="m-down">{{ $t('Network settings') }}</h4>

    <div class="grid">
      <div>{{ $t('Connection status') }}</div>
      <div v-if="gettingWifi || settingWifi" class="relative" style="align-self: start"><Spinner class="inline" /></div>
      <div v-else>
        <el-tooltip placement="top" :content="hasWifi ? $t('Connected') : $t('Not connected')">
          <Icon class="status-icon" type="signal" :class="{ 'color-primary': hasWifi }" />
        </el-tooltip>
        <el-tooltip placement="top" :content="hasInternet ? $t('Online') : $t('Offline')">
          <Icon class="status-icon" type="internet" :class="{ 'color-primary': hasInternet }" />
        </el-tooltip>
      </div>

      <div>{{ $t('Current WiFi') }}</div>
      <div class="toggle-wifi flex-space-between" @click="toggleWifiSettings = !toggleWifiSettings">
        <span>{{ ssid || '-' }}</span>
        <Icon v-if="hasWifi" type="edit" :class="{ active: toggleWifiSettings }" />
      </div>

      <template v-if="(toggleWifiSettings || !hasWifi) && !gettingWifi">
        <div>{{ $t('SSID') }}</div>
        <Field
          ref="elSSID"
          v-model="ssidNew"
          type="select"
          :allow-create="true"
          :options="ssids"
          :disabled="settingWifi"
          @keyup.enter="elPassword.firstElementChild.focus"
        />

        <div>{{ $t('Password') }}</div>
        <Field
          ref="elPassword"
          v-model="password"
          :disabled="settingWifi"
          @keyup.enter="setWifi"
        />

        <div />
        <el-button :disabled="hasError || settingWifi || !ssidNew" @click="setWifi">{{ $t('Set WiFi') }}</el-button>
      </template>
    </div>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus';
import i18next from 'i18next';
import { ref, reactive, computed, watchEffect } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import useValidate from '../../../composables/useValidate';
import localEdgeStore from '../../../../modules/edges/local/store';

export default {
  setup() {
    const toggleWifiSettings = ref(false);
    const data = reactive({
      ssid: '',
      password: '',
    });

    const { errors, hasError, validate } = useValidate({
      data,
      schema: yupObject({
        ssid: yupString().required().max(32).label('SSID'),
      }),
    });

    const { ssid, ssids, hasWifi, hasInternet } = localEdgeStore.getters;

    const gettingWifi = computed(() => !localEdgeStore.state.network);
    const settingWifi = computed(() => localEdgeStore.state.settingWifi);
    const version = computed(() => localEdgeStore.state.device?.configuratorVersion || '');

    watchEffect(() => {
      data.ssid = data.ssid || ssid.value;
    });

    return {
      toggleWifiSettings,
      data,

      errors,
      hasError,

      ssid,
      ssids,
      hasWifi,
      hasInternet,

      gettingWifi,
      settingWifi,
      version,

      async setWifi() {
        if (await validate()) {
          try {
            await localEdgeStore.dispatch.setWifi({ ssid: data.ssid, password: data.password });
            toggleWifiSettings.value = false;
          } catch (err) {
            try {
              await ElMessageBox.alert(i18next.t('Unable to connect to WiFi.'), i18next.t('WiFi'), {
                confirmButtonText: i18next.t('OK'),
              });
            } catch (err2) {
              // Catching cancelling to avoid error message in console.
            }
          }
        }
      },
    };
  },
};
</script>

<style scoped lang="less">
.status-icon {
  padding-right: var(--row-gap);
  opacity: 0.4;

  &.color-primary {
    opacity: 0.8;
  }
}

.toggle-wifi {
  cursor: pointer;

  &:hover .icon {
    opacity: 1;
  }

  .icon {
    padding: 0 1rem;
    opacity: 0.5;

    &.active {
      color: rgb(var(--color-nature));
      opacity: 1;
    }
  }
}

.el-collapse,
.el-collapse-item {
  border: none;
}

.el-collapse:deep(.el-collapse-item__header) {
  height: calc(var(--row-gap) * 2);
  padding-left: 0;

  &:after {
    right: 1.25rem;
  }
}
</style>
