<template>
  <SideMenu>
    <!-- Main -->
    <div class="dashboard-menu text-center">
      <div class="user-picture m-block">
        <Upload
          :disabled="isSubmitting || isUploading"
          :uploading="isUploading"
          :image="user && user.profile && user.profile.picture"
          @input="upload('postPicture', $event)"
          @remove="removeProperty('profile.picture')"
        />
      </div>

      <div class="grid m-block">
        <h1 v-if="name && !isEditting" style="cursor: pointer;" @click="isEditting = true">{{ name }}</h1>
        <h1 v-if="!name">{{ $t('Hi! What is your name?') }}</h1>
        <Field v-if="!name || isEditting" ref="elName" :model-value="item.profile.fullName" @update:model-value="setName">{{ $t('Full name') }}</Field>
        <div>{{ user.email }}</div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <router-link v-if="showAdmin" to="/admin" class="block row-lines-inner">
        <el-button class="-common-height -quadratic -borderless -block">
          <div class="auto-fr-grid">
            <Icon type="settings" />
            <span>Admin console</span>
          </div>
        </el-button>
      </router-link>
    </template>
  </SideMenu>
</template>


<script>
import _ from 'lodash';
import { ref, computed, watchEffect } from 'vue';

import useSave from '../../composables/useSave';
import Upload from '../../components/Upload.vue';
import SideMenu from '../../components/layout/SideMenu.vue';
import { showError } from '../../utils/error';
import authStore from '../../../modules/auth/store';
import usersStore from '../../../modules/users/store';

export default {
  components: { Upload, SideMenu },

  setup() {
    const isEditting = ref(false);
    const elName = ref(null);

    const save = useSave({ actual: authStore.getters.user, store: usersStore });

    watchEffect(() => elName.value?.$el?.querySelector('input')?.focus());

    return {
      ...save,

      isEditting,
      elName,

      user: authStore.getters.user,
      name: authStore.getters.name,

      // TODO: TAG: RESTRUCTURE superuser
      showAdmin: computed(() => true),

      async setName(value) {
        try {
          _.set(save.item, 'profile.fullName', value);
          await save.saveProperty('profile.fullName');
          isEditting.value = false;
        } catch (error) {
          showError(error);
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.dashboard-menu {
  padding: 0 10% var(--row-gap);
}

.user-picture {
  border-radius: 50%;
  overflow: hidden;
  max-width: calc(var(--common-size) * 2.5);
  max-height: calc(var(--common-size) * 2.5);
  margin-left: auto;
  margin-right: auto;

  &:deep(.upload) {
    min-height: calc(var(--common-size) * 2.5);

    .upload-instruction {
      display: none;
    }
  }
}
</style>
