<template>
  <div v-page-title="$t('Control panel')" class="control-panel fill-view-height background-logo">
    <div v-if="error" class="fill centered color-error font-big2">
      {{ error }}
    </div>

    <div v-else-if="!spaceId" class="fill centered color-error font-big2">
      {{ $t('Unable to open control panel without space.') }}
    </div>

    <Spinner v-else-if="fetching" />

    <div v-else class="fill-height pane-header-always relative">
      <transition name="fade" appear>
        <div class="flex flex-column fill-height">
          <div class="header centered -common-height">
            <Icon type="deviceOchnoOperated" class="font-big2" />
          </div>

          <ControlPanelFiller
            :control-scheme-id="controlSchemeId"
            :space-id="spaceId"
            :mechanism-ids="mechanismIds"
            :hub-ids="hubIds"
            :hw-ids="hwIds"
            :port-ids="portIds"
            :controls="controls"
          />
        </div>
      </transition>

      <AnalyticsPane
        v-if="panes.analytics.open"
        :inactive-close="panes.analytics.inactiveClose"
        class="absolute-cover"
        @close-pane="back"
      />
    </div>
  </div>
</template>


<script>
import i18next from 'i18next';
import _ from 'lodash';
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ControlPanelFiller from './ControlPanelFiller.vue';
import AnalyticsPane from '../manage/AnalyticsPane.vue';
import useFetchers from '../../composables/useFetchers';
import useIotSubscribe from '../../composables/useIotSubscribe';
import { showError } from '../../utils/error';
import authStore from '../../../modules/auth/store';
import controlSchemesStore from '../../../modules/controlschemes/store';
import hubsStore from '../../../modules/hubs/store';
import spacesStore from '../../../modules/spaces/store';
import workspaceStore from '../../../modules/workspace/store';

const fifteenMinutesInSec = 15 * 60;

export default {
  components: { ControlPanelFiller, AnalyticsPane },

  setup() {
    const controlSchemeId = ref(undefined);
    const spaceId = ref(undefined);
    const mechanismIds = ref(undefined);
    const hubIds = ref(undefined);
    const hwIds = ref(undefined);
    const portIds = ref(undefined);
    const controls = ref(undefined);
    const error = ref('');

    const panes = reactive({
      analytics: { open: false, inactiveClose: fifteenMinutesInSec },
    });

    const spaceParams = computed(() => spaceId.value && (!controlSchemeId.value || controlSchemesStore.state.controlSchemes[controlSchemeId.value]));
    const space = computed(() => {
      if (workspaceStore.state.spaceId !== spaceId.value) {
        workspaceStore.dispatch.set({ spaceId: spaceId.value });
      }
      return workspaceStore.getters.space.value || {};
    });

    const route = useRoute();
    const router = useRouter();

    useIotSubscribe({ space });
    useFetchers([
      { store: spacesStore, action: 'getOne', params: () => ({ id: spaceId.value }), trigger: spaceParams },
    ]);

    watch(
      () => controlSchemeId.value,
      async () => {
        authStore.dispatch.setJWT({ token: null });

        if (controlSchemeId.value) {
          try {
            await controlSchemesStore.dispatch.use({ id: controlSchemeId.value });
          } catch (err) {
            const res = _.get(error, 'response.data');
            if (res.message === 'Incorrect credentials') {
              error.value = i18next.t('Control scheme uses an incorrect credentials.');
            } else if (res.code === 400) {
              error.value = i18next.t('Control scheme does not exist.');
            } else {
              error.value = i18next.t('Unable to use control scheme.');
            }
          }
        }
      },
      { immediate: true },
    );

    watch(
      () => route.query,
      (newValue, oldValue = {}) => {
        // This function is basically made to avoid using computed properties.
        // This is because the route.query triggers recomputation if anything in it is changed.
        // Which in turn causes a lot of things to recompute.
        const csId = newValue.controlScheme || newValue.controlscheme;
        if (!_.isEqual(csId, controlSchemeId.value)) {
          controlSchemeId.value = csId;
        }

        if (!_.isEqual(newValue.space, spaceId.value)) {
          spaceId.value = newValue.space;
        }

        if (!_.isEqual(newValue.mechanism, oldValue.mechanism)) {
          mechanismIds.value = newValue.mechanism && _.castArray(newValue.mechanism);
        }

        if (!_.isEqual(newValue.hub, oldValue.hub)) {
          hubIds.value = newValue.hub && _.castArray(newValue.hub);
        }

        if (!_.isEqual(newValue.serial, oldValue.serial)) {
          hwIds.value = newValue.serial && _.castArray(newValue.serial);
          if (hwIds.value) {
            _.castArray(hwIds.value).forEach((hwId) => {
              hubsStore.dispatch.getHwId({ hwId })
                .catch((e) => showError(e));
            });
          }
        }

        if (!_.isEqual(newValue.port, oldValue.port)) {
          portIds.value = newValue.port && _.castArray(newValue.port);
        }

        if (!_.isEqual(newValue.controls, oldValue.controls)) {
          if (newValue.controls) {
            try {
              const ctrls = JSON.parse(newValue.controls);
              if (!Array.isArray(ctrls) || ctrls.find((control) => !_.isObject(control))) {
                throw new Error();
              }
              controls.value = ctrls;
            } catch (err) {
              error.value = i18next.t('Controls are not formatted correctly.');
            }
          } else {
            controls.value = undefined;
          }
        }

        if (!_.isEqual(newValue.pane, oldValue.pane)) {
          const queryPanes = _.castArray(newValue.pane);
          Object.entries(panes).forEach(([key, value]) => {
            value.open = queryPanes.indexOf(key) >= 0; // eslint-disable-line no-param-reassign
          });
        }
      },
      { immediate: true },
    );

    onUnmounted(() => authStore.dispatch.setJWT({ token: null }));

    return {
      controlSchemeId,
      spaceId,
      mechanismIds,
      hubIds,
      hwIds,
      portIds,
      controls,
      error,
      panes,

      fetching: computed(() => controlSchemesStore.state.fetching || spacesStore.state.fetching),

      back: () => router.back(),
    };
  },
};
</script>


<style scoped lang="less">
</style>
