<template>
  <Workspace v-page-title="$t('Dashboard')" @overrun="overrun">
    <!-- Top menu -->
    <template #menu>
      <DashboardMenu />
    </template>

    <!-- Pane switches -->
    <template #function>
      <Icon type="deviceOchnoOperated" class="font-big2" />

      <div class="absolute m-end" style="top: 0; right: 0;">
        <el-checkbox :model-value="panes.accounts.open" class="-square -common-height bg-transparent" @input="togglePane(panes.accounts)">
          <Icon type="home" />
          <h3 class="function-text">{{ $t('Account') }}</h3>
        </el-checkbox>

        <!-- <el-checkbox :model-value="panes.hubs.open" class="-square -common-height bg-transparent" @input="togglePane(panes.hubs)">
          <Icon type="hub" />
          <h3 class="function-text">{{ $t('Hubs') }}</h3>
        </el-checkbox> -->
      </div>
    </template>

    <!-- Content -->
    <Scrollbar class="choices fill-height scrollbar-fill">
      <div class="choices-grid grid">
        <Spinner v-if="fetching" class="fill centered" />

        <router-link v-for="space in choices" :key="space.id" :to="`/app/manage/${space.id}`" class="choice grid bg-gray-2">
          <div class="choice-image-wrapper bg-gray-1">
            <img class="choice-image" :src="choiceBackground(space)" loading="lazy">
          </div>
          <div class="choice-name grid">
            <h1>{{ space.name }}</h1>
          </div>
        </router-link>
      </div>

      <div class="flex-space-around -common-height">
        <div class="el-button -quadratic" @click="showDialog = true">
          <div class="centered flex-row">
            <Icon type="add" style="margin-right: 1rem" />
            <span>{{ $t('Create space') }}</span>
          </div>
        </div>
      </div>
    </Scrollbar>

    <CreateSpaceDialog v-model:show="showDialog" @created="createdSpace" />

    <template #panes>
      <AccountsPane
        v-if="panes.accounts.open || panes.accounts.hidden"
        min="250px"
        init="550px"
        :style="{ display: panes.accounts.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.accounts)"
      />
    </template>
  </Workspace>
</template>


<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

import AccountsPane from './AccountsPane.vue';
import CreateSpaceDialog from './CreateSpaceDialog.vue';
import DashboardMenu from './DashboardMenu.vue';
import useFetchers from '../../composables/useFetchers';
import useWorkspace from '../../components/layout/useWorkspace';
import Workspace from '../../components/layout/Workspace.vue';
import accountsStore from '../../../modules/accounts/store';
import spacesStore from '../../../modules/spaces/store';

export default {
  components: { AccountsPane, CreateSpaceDialog, DashboardMenu, Workspace },

  setup() {
    const panes = reactive({
      accounts: { open: false, hidden: false, time: 0 },
      hubs: { open: false, hidden: false, time: 0 },
    });

    const showDialog = ref(false);

    const router = useRouter();

    const { closePane, togglePane, overrun } = useWorkspace({ panes });

    useFetchers([
      { store: accountsStore },
      { store: spacesStore },
    ]);

    return {
      panes,
      showDialog,

      closePane,
      togglePane,
      overrun,

      fetching: computed(() => spacesStore.state.fetching),

      choices: computed(() => {
        const { title } = spacesStore.getters;
        return Object.values(spacesStore.state.spaces).sort((space1, space2) => (title.value(space1) < title.value(space2) ? 1 : -1));
      }),

      choiceBackground(space) {
        const url = space?.attributes?.preview;
        if (url) {
          return url;
        }

        const image = space?.items?.find(({ type }) => type === 'image');
        if (image) {
          return image.url;
        }

        return '';
      },

      createdSpace(space) {
        router.push(`/app/manage/${space.id}`);
      },
    };
  },
};
</script>


<style scoped lang="less">
.choices-grid {
  grid-auto-rows: minmax(18rem, 1fr);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  min-height: calc(100% - var(--common-size));
  align-items: initial;
  row-gap: var(--column-gap);
}

.choice {
  grid-template-rows: 1fr min-content;
  cursor: pointer;
  align-items: initial;
  row-gap: 0;
  margin-top: 0;

  &:hover {
    .choice-image {
      filter: brightness(110%);
    }
    .choice-name {
      background-color: rgb(var(--color-gray-2a));
    }
    h1, h3 {
      color: rgb(var(--color-primary));
    }
  }
}

.choice-image-wrapper {
  display: flex;
  align-items: center;
}

.choice-image {
  max-width: 100%;
  max-height: 100%;
}

.choice-name {
  padding: calc(var(--row-gap) * 0.5) calc(var(--column-gap) * 3) calc(var(--row-gap) * 0.75);
  row-gap: calc(var(--row-gap) * 0.5);
}

.darker {
  opacity: 0.5;
}
</style>
