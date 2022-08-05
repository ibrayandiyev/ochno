<template>
  <transition name="signin-transition">
    <div class="fill-view-height background-polygons background-cover">
      <OperatedColumn v-page-title="$t('Welcome')">

        <Login v-if="showLogin" />
        <PasswordRecovery v-else />

        <el-button class="-borderless m-up-2" @click="showLogin = !showLogin">
          <h4>{{ $t(!showLogin ? 'Sign in' : 'Forgotten password') }}</h4>
        </el-button>

        <template #footer>
          <Field type="select" class="change-server -quadratic m-auto bg-transparent" popper-class="-quadratic" @input:model-value="changeServer">
            <template #options>
              <el-option value="operated.ochno.com" />
              <el-option value="stage.ochno.com" />
            </template>
            <h4>{{ $t('Change server') }}</h4>
          </Field>
        </template>
      </OperatedColumn>
    </div>
  </transition>
</template>


<script>
import { ref } from 'vue';

import Login from './Login.vue';
import PasswordRecovery from './PasswordRecovery.vue';
import OperatedColumn from '../../components/layout/OperatedColumn.vue';

export default {
  components: { Login, OperatedColumn, PasswordRecovery },

  setup() {
    const showLogin = ref(true);

    return {
      showLogin,

      changeServer(value) {
        window.location = `https://${value}/${window.location.hash}`;
      },
    };
  },
};
</script>


<style scoped lang="less">
.change-server {
  max-width: 12em;
  opacity: 0.7;

  &:deep(.el-input:after) {
    opacity: 0.5;
  }
}

// Transition effect when logging in.
.signin-transition-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0;
  z-index: 1;
  transition-duration: 0.4s; // To tell vue about the duration.
}
</style>
