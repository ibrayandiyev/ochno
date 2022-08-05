<template>
  <div class="control-scheme-list control-width relative bg-gray-1">
    <div class="absolute-cover">
      <Scrollbar>
        <Spinner v-if="fetching" />

        <el-button class="back-arrow absolute -square -common-height -borderless" @click="emit('back');">
          <Icon type="arrow" />
        </el-button>

        <div class="header-info grid p-block bg-gray-2">
          <h3>{{ $t('Control panel') }}</h3>
          <div class="info">
            {{ $t('A control panel allows for a quick, simple and customizable way to control your devices.') }}
          </div>
          <div class="info">
            {{ $t('Select a control scheme to get started.') }}
          </div>
        </div>

        <div class="m-down">
          <div v-for="scheme in controlSchemes" :key="scheme.id" class="scheme-grid grid row-lines -common-height" @click="selected = scheme.id">
            <div style="justify-self: start">{{ title(scheme.id) }}</div>
            <Icon type="arrow" />
          </div>
        </div>

        <div class="text-center">
          <el-button class="create-button" @click="createControlScheme">
            <div class="auto-fr-grid">
              <Icon type="add" />
              <span>{{ $t('Create new control scheme') }}</span>
            </div>
          </el-button>

          <a :href="defaultUrl" target="_blank">
            <el-button class="create-button flex -quadratic -borderless">
              {{ $t('Open default control panel') }}
            </el-button>
          </a>
        </div>
      </Scrollbar>
    </div>

    <transition name="slide-from-left">
      <ControlScheme v-if="selected" :control-scheme-id="selected" :space-id="spaceId" :users="guestUsers" @back="noSelection" />
      <ControlScheme v-else-if="createNew" :setup-control-scheme="createNew" :space-id="spaceId" :users="guestUsers" @back="() => createNew = null" />
    </transition>
  </div>
</template>


<script>
import { ref, computed, watchEffect } from 'vue';

import ControlScheme from './ControlScheme.vue';
import useFetchers from '../../../composables/useFetchers';
import controlSchemesStore from '../../../../modules/controlschemes/store';
import usersStore from '../../../../modules/users/store';
import workspaceStore from '../../../../modules/workspace/store';

export default {
  components: { ControlScheme },

  props: {
    spaceId: { type: String, required: true },
  },

  emits: ['back'],

  setup(props, { emit }) {
    useFetchers([
      { store: controlSchemesStore },
      { store: usersStore },
    ]);

    const selected = ref('');
    const createNew = ref('');

    const noSelection = () => {
      selected.value = '';
    };

    watchEffect(() => !controlSchemesStore.state.controlSchemes[selected.value] && noSelection());

    return {
      emit,

      selected,
      createNew,

      controlSchemes: controlSchemesStore.state.controlSchemes,
      users: usersStore.state.users,

      title: controlSchemesStore.getters.title,
      fetching: computed(() => controlSchemesStore.state.fetching),

      // TODO: TAG: RESTRUCTURE
      guestUsers: computed(() => []),

      defaultUrl: computed(() => `${window.location.origin}/#/app/controlpanel?space=${props.spaceId}`),

      noSelection,

      createControlScheme() {
        const space = workspaceStore.getters.space.value;
        createNew.value = { accountId: space.accountId, spaceId: space.id };
      },
    };
  },
};
</script>


<style scoped lang="less">
.control-scheme-list {
  margin: 0;
  overflow: hidden;
}

.scheme-grid {
  grid-template-columns: 1fr var(--common-size);
  justify-items: center;
  padding-left: var(--row-gap) !important;
  cursor: pointer;
  margin-top: 0;

  &:hover {
    color: rgb(var(--color-nature));
  }
}

.create-button {
  margin: var(--row-gap) auto 0;
  opacity: 0.7;
}
</style>
