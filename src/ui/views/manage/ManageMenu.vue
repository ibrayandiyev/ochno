<template>
  <SideMenu @open="!$event && close()">
    <!-- Main -->
    <div class="manage-menu">
      <div class="centered -common-height" style="display: flex">
        <h4>{{ $t('Space') }}</h4>
      </div>

      <div v-if="item" class="manage-grid auto-fr-grid">
        <div class="-circle"><Icon type="map" /></div>
        <Field v-model="item.name" :label="'Unnamed space'" @update:model-value="saveProperty('name')" />

        <Icon type="photo" />
        <label class="el-button grid" :class="{ 'is-disabled': isUploading }">
          <input type="file" accept="image/*,.dxf" :disabled="isUploading" @change="setImage">
          {{ $t('Set image') }}
        </label>

        <Icon type="controls" />
        <el-button :class="{ 'is-current': showControlSchemeList }" @click="showControlSchemeList = !showControlSchemeList">
          {{ $t('Control panel') }}
        </el-button>

        <Icon type="edge" />
        <el-button @click="showEdgeSetup = true">
          {{ edge ? $t('Edge settings') : $t('Setup Edge') }}
        </el-button>
      </div>
    </div>

    <template #footer>
      <router-link v-if="showAdmin" :to="space ? '/admin?pane=spaces' : ''" class="block row-lines-inner">
        <el-button class="-common-height -quadratic -borderless -block">
          <div class="auto-fr-grid">
            <Icon type="settings" />
            <span>Admin console</span>
          </div>
        </el-button>
      </router-link>

      <router-link to="/app" class="block row-lines-inner">
        <el-button class="-common-height -quadratic -borderless -block">
          <div class="auto-fr-grid">
            <Icon type="location" />
            <span>{{ $t('Dashboard') }}</span>
          </div>
        </el-button>
      </router-link>
    </template>

    <template #sidebar>
      <transition name="slide-from-left">
        <ControlSchemeList v-if="showControlSchemeList" :space-id="space.id" class="fill-height" @back="showControlSchemeList = false" />
      </transition>

      <el-dialog v-model="showEdgeSetup" :append-to-body="true" :close-on-click-modal="false">
        <template #header>
          <h1>{{ edge ? `${$t('Edge')}: ${edge.name || edge.hwId}` : $t('New Edge device') }}</h1>
          <el-button class="-square -common-height -borderless" @click="showEdgeSetup = false">
            <Icon type="delete" />
          </el-button>
        </template>

        <EdgeSetup v-if="showEdgeSetup" :edge="edge" :space="space" @close="showEdgeSetup = false" />
      </el-dialog>
    </template>
  </SideMenu>
</template>


<script>
import _ from 'lodash';
import { ref, computed } from 'vue';

import useSave from '../../composables/useSave';
import SideMenu from '../../components/layout/SideMenu.vue';
import ControlSchemeList from '../../templates/controlschemes/setup/ControlSchemeList.vue';
import EdgeSetup from '../../templates/edges/setup/EdgeSetup.vue';
import { showError } from '../../utils/error';
import workspaceStore from '../../../modules/workspace/store';
import spacesStore from '../../../modules/spaces/store';

export default {
  components: { SideMenu, ControlSchemeList, EdgeSetup },

  setup() {
    const showControlSchemeList = ref(false);
    const showEdgeSetup = ref(false);

    const { space, edge } = workspaceStore.getters;

    const save = useSave({ actual: space, store: spacesStore });

    return {
      ...save,

      showControlSchemeList,
      showEdgeSetup,

      space,
      edge,

      // TODO: TAG: RESTRUCTURE superuser
      showAdmin: computed(() => true),

      close() {
        showControlSchemeList.value = false;
        showEdgeSetup.value = false;
      },

      async setImage(event) {
        _.remove(save.item.items, { type: 'image' });
        if (save.item.attributes) {
          delete save.item.attributes.preview;
        }
        try {
          await save.saveItem(undefined, true);
          await save.upload('postImage', event?.target?.files?.[0]);
        } catch (err) {
          showError(err);
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.manage-menu {
  padding: 0 10% var(--row-gap);
}

.manage-grid {
  justify-content: center;
}
</style>
