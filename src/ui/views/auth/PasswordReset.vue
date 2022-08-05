<template>
  <div class="fill-view-height background-shards background-cover">
    <OperatedColumn v-page-title="$t('Password reset')">
      <div class="relative">
        <Spinner v-if="isSubmitting" class="fill centered" />

        <h1 class="m-down-common">{{ $t('Password reset') }}</h1>

        <template v-if="user">
          <div class="h3 m-down-col">{{ $t('Email') }}</div>
          <Field type="email" :model-value="user.email" :disabled="true" class="m-auto m-down-1_5" />

          <div class="h3 m-down-col">{{ $t('Password') }}</div>
          <Field v-model="password" type="password" :message="errors.password" class="m-auto m-down-2" @keyup.enter="reset">
            {{ $t('New password') }}
          </Field>
        </template>

        <div v-if="submitError" class="m-down-1_5">
          <span class="font-small2 bg-error-heavy font-transparent m-end -circle"><Icon type="error" /></span>
          <span class="text-left">{{ $t(submitError.text) }}</span>
        </div>

        <template v-if="user">
          <el-button type="primary" :disabled="isSubmitting || hasError" @click="reset">
            {{ $t('Reset password') }}
          </el-button>

          <div v-if="message" class="control-grid no-control-label m-up-2">
            <div class="font-small2 -circle"><Icon type="info" /></div>
            <div class="text-left">{{ $t(message) }}</div>
          </div>
        </template>
      </div>

      <el-button class="-borderless m-up-2" @click="signin">
        <h4>{{ $t('Sign in') }}</h4>
      </el-button>
    </OperatedColumn>
  </div>
</template>


<script>
import i18next from 'i18next';
import { ref, reactive, toRefs, toRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import useSubmitter from '../../composables/useSubmitter';
import useValidate from '../../composables/useValidate';
import OperatedColumn from '../../components/layout/OperatedColumn.vue';
import authStore from '../../../modules/auth/store';
import usersStore from '../../../modules/users/store';

const schema = usersStore.validation.pick(['password']);

export default {
  components: { OperatedColumn },

  setup() {
    const router = useRouter();
    const route = useRoute();

    const data = reactive({
      password: '',
    });
    const message = ref('');
    const user = ref(null);

    const { errors, hasError, validate } = useValidate({ data, schema });
    const { submit, isSubmitting, submitError } = useSubmitter();

    // created
    (async () => {
      if (!route.params.token) {
        submitError.value = { text: i18next.t('A reset token could not be found. Try again.') };
        return;
      }
      try { // Try to get the reset token.
        user.value = await submit(authStore.dispatch.getReset({ token: route.params.token }));
      } catch (err) {
        submitError.value = { text: i18next.t('A reset token could not be found. Try again.') };
      }
    })();

    return {
      ...toRefs(data),
      message,
      user,
      errors,
      hasError,
      isSubmitting,
      submitError,

      reset: async () => {
        if (await validate()) {
          try {
            await submit(authStore.dispatch.reset({ ...toRaw(data), token: route.params.token }));
            message.value = i18next.t('Password changed successfully, redirecting...');
            const newRoute = (route.query?.route && decodeURIComponent(route.query.route)) || '/app';
            setTimeout(() => router.push(newRoute), 3000);
          } catch (err) {
            // The error is already in submitError.
          }
        }
      },

      signin: () => router.push('/signin'),
    };
  },
};
</script>


<style scoped lang="less">
</style>
