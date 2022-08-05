<template>
  <div class="edge-setup control-width p-block-s p-block">
    <div v-if="!hasContact">
      <div class="section">
        <h1 class="m-down text-center">{{ $t('How to discover an Edge device') }}</h1>
        <ul class="margin">
          <li>{{ $t('Connect to your Edge device using a network cable.') }}</li>
        </ul>
        <ul>{{ $t('Establishing a connection may take up to a minute after the cable has been connected.') }}</ul>
      </div>
      <h3 class="m-down text-center">{{ $t('Discovering...') }}</h3>
      <div class="text-center"><Spinner class="inline bg-transparent" /></div>
    </div>

    <div v-else-if="error">
      <div class="section">
        <h1 class="m-down text-center">{{ $t('An error occured') }}</h1>
        <div>{{ $t('Something went wrong on the server, try again later.') }}</div>
      </div>
    </div>

    <div v-else-if="fetching || connectedEdge === false">
      <div class="section">
        <h1 class="m-down text-center">{{ $t('Accessing...') }}</h1>
        <div>{{ $t('Found connected device. Setting up access point.') }}</div>
      </div>
      <div class="text-center"><Spinner class="inline bg-transparent" /></div>
    </div>

    <div v-else-if="fetchId">
      <div class="section">
        <Spinner v-if="saving" />

        <h1 class="m-down text-center">{{ $t('Move Edge device') }}</h1>
        <div class="margin">{{ $t('The connected Edge device is used in another space. It can only be used in one place at a time. If you move it you will remove its functionality from the other space.') }}</div>
        <div class="section">{{ $t('It may take several minutes before all your connected devices are up and running again.') }}</div>
        <div class="grid">
          <div>{{ $t('Serial number') }}</div>
          <div>{{ serial }}</div>

          <div>{{ $t('Moving from') }}</div>
          <div>{{ edgeSpaceName }}</div>

          <div>{{ $t('Moving to') }}</div>
          <div>{{ space.name }}</div>
        </div>
      </div>
      <div class="flex-space-around">
        <el-button @click="emit('close')">{{ $t('Cancel') }}</el-button>
        <el-button @click="move()">{{ $t('Move Edge device') }}</el-button>
      </div>
    </div>

    <div v-else-if="isConfiguring">
      <div class="section">
        <h1 class="m-down text-center">{{ $t('Configuring Edge device...') }}</h1>
        <div>{{ $t('It may take several minutes before all your connected devices are up and running again.') }}</div>
      </div>
      <div class="text-center"><Spinner class="inline bg-transparent" /></div>
    </div>

    <div v-else-if="needsPermission">
      <div class="section">
        <h1 class="m-down text-center">{{ $t('Unavailable Edge device') }}</h1>
        <div class="text-center">{{ $t('You do not have permission to view the connected Edge device.') }}</div>
      </div>
    </div>

    <div v-else-if="needsTransition">
      <div class="section">
        <h1 class="m-down text-center">{{ $t('Unavailable Edge device') }}</h1>
        <div>{{ $t('The connected Edge device is set up to run in another installation that you do not have access to. If this device belongs to you, please request a transition from the previous owner.') }}</div>
      </div>
    </div>

    <div v-else-if="needsReset">
      <div class="section">
        <h1 class="m-down text-center">{{ $t('Reset Edge device') }}</h1>
        <div class="margin">{{ $t('The settings in the connected Edge device do not match those set in Ochno Operated. Would you like to clear the device settings to set it up again?') }}</div>
        <div>{{ $t('Resetting your Edge device may take several minutes and all connected devices will be temporarily unavailable. Is this ok?') }}</div>
      </div>
      <div class="flex-space-around">
        <el-button @click="emit('close')">{{ $t('Cancel') }}</el-button>
        <el-button @click="reset()">{{ $t('Reset') }}</el-button>
      </div>
    </div>

    <div v-else-if="needsSetup">
      <div class="section">
        <h1 class="m-down text-center">{{ $t('Setting up new Edge device') }}</h1>
        <div class="margin">{{ $t('There is an Edge device connected that is capable of running your automatization offline. Do you want to use the device with your current space?') }}</div>
        <div class="section">{{ $t('This procedure might take several minutes and your connected devices might be temporarily unavailable during this period.') }}</div>
        <div class="grid">
          <div>{{ $t('Serial number') }}</div>
          <div>{{ serial }}</div>

          <div>{{ $t('Space') }}</div>
          <div>{{ space.name }}</div>
        </div>
      </div>
      <div class="flex-space-around">
        <el-button @click="emit('close')">{{ $t('Cancel') }}</el-button>
        <el-button @click="setup()">{{ $t('Setup') }}</el-button>
      </div>
    </div>

    <div v-else>
      <EdgeSetupDevice />
    </div>

    <div v-if="showEdgeSettings" class="operated-settings relative">
      <Spinner v-if="fetching || saving" />

      <DashedLine class="section" />
      <EdgeSetupOperated :space-name="space.name" :serial="edge.hwId" @remove="remove" />
    </div>
  </div>
</template>


<script>
import { ElMessageBox } from 'element-plus';
import i18next from 'i18next';
import { ref, computed, watch, onUnmounted } from 'vue';

import EdgeSetupDevice from './EdgeSetupDevice.vue';
import EdgeSetupOperated from './EdgeSetupOperated.vue';
import DashedLine from '../../../components/DashedLine.vue';
import useFetchers from '../../../composables/useFetchers';
import edgesStore from '../../../../modules/edges/store';
import localEdgeStore from '../../../../modules/edges/local/store';
import spacesStore from '../../../../modules/spaces/store';

export default {
  components: { EdgeSetupDevice, EdgeSetupOperated, DashedLine },

  props: {
    edge: { type: Object },
    space: { type: Object, required: true },
  },

  emits: ['close'],

  setup(props, { emit }) {
    const error = ref(null);

    const { hasContact, isConfiguring, needsPermission, needsTransition, needsReset, needsSetup } = localEdgeStore.getters;

    const serial = computed(() => localEdgeStore.state.device?.serial || '');
    const connectedEdge = computed(() => localEdgeStore.state.edge);
    const edgeSpaceId = computed(() => localEdgeStore.state.edge?.spaceId);
    const edgeSpaceName = computed(() => (edgeSpaceId.value ? spacesStore.getters.title.value(edgeSpaceId.value) : '-'));
    const fetchId = computed(() => ((edgeSpaceId.value && edgeSpaceId.value === props.space.id) ? null : edgeSpaceId.value)); // Only return id if it is not already fetched.

    useFetchers([
      { store: spacesStore, params: () => ({ id: fetchId.value }), trigger: fetchId },
    ]);

    watch(
      () => props.space,
      () => localEdgeStore.dispatch.init(),
      { immediate: true },
    );

    onUnmounted(() => localEdgeStore.dispatch.clear());

    return {
      emit,

      error,

      hasContact,
      isConfiguring,
      needsPermission,
      needsTransition,
      needsReset,
      needsSetup,

      serial,
      connectedEdge,
      edgeSpaceName,
      fetchId,

      showEdgeSettings: computed(() => props.edge && !error.value && (!serial.value || (!fetchId.value && !isConfiguring.value && !needsTransition.value && !needsSetup.value))),
      fetching: computed(() => edgesStore.state.fetching),
      saving: computed(() => edgesStore.state.saving),

      async setup() {
        try {
          await localEdgeStore.dispatch.setupEdge({ spaceId: props.space.id });
        } catch (err) {
          error.value = err;
        }
      },

      async remove() {
        const fullReset = serial.value && !fetchId.value;
        try {
          await ElMessageBox.confirm(
            `${i18next.t('By removing the Edge device any offline functionality will stop working and your devices will need Internet to operate properly. Is this ok?')}
            <br />
            <br />
            ${fullReset ? i18next.t('It may take several minutes before all your connected devices are up and running again.') : i18next.t('If your Edge device does not currently have Internet connection, it will be updated first when it has.')}`,
            i18next.t('Remove Edge device'),
            {
              dangerouslyUseHTMLString: true,
              cancelButtonText: i18next.t('Cancel'),
              confirmButtonText: i18next.t('Yes'),
            },
          );
        } catch (err) {
          return; // ElMessageBox catch to avoid console errors.
        }

        try {
          if (fullReset) {
            await localEdgeStore.dispatch.resetEdge();
          } else {
            await localEdgeStore.dispatch.removeEdge(props.edge);
          }
        } catch (err) {
          error.value = err;
        }
      },

      async reset() {
        try {
          await ElMessageBox.confirm(i18next.t('Resetting your Edge device will remove the current settings from the device and remove the connection to this space. Any offline functionality will stop working and your devices will need Internet to operate properly. This may take several minutes and all connected devices will be temporarily unavailable. Is this ok?'), i18next.t('Reset Edge device'), {
            cancelButtonText: i18next.t('Cancel'),
            confirmButtonText: i18next.t('Yes'),
          });
        } catch (err) {
          return; // ElMessageBox catch to avoid console errors.
        }

        try {
          await localEdgeStore.dispatch.resetEdge();
        } catch (err) {
          error.value = err;
        }
      },

      async move() {
        try {
          await localEdgeStore.dispatch.updateEdge({ spaceId: props.space.id });
        } catch (err) {
          error.value = err;
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
ul {
  padding-right: 40px;
}

.section {
  margin-bottom: calc(var(--row-gap) * 1.5);
}

.margin {
  margin-bottom: var(--column-gap);
}

.edge-setup:deep(.grid) {
  grid-template-columns: 10em 1fr;
  word-break: break-all;
  margin-bottom: calc(var(--row-gap) * 1.25);
  user-select: text;
}

.operated-settings {
  margin: calc(var(--row-gap) * 1.5) 0 calc(var(--row-gap) * -2);
}
</style>
