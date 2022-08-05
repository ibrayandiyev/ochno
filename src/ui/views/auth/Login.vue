<template>
  <div class="relative">
    <Spinner v-if="isSubmitting" class="fill centered" />

    <h1 class="m-down-common">{{ $t('Sign in') }}</h1>

    <div class="h3 m-down-col">{{ $t('Email') }}</div>
    <!-- TODO: RESTRUCTURE: Enter should go to next. -->
    <Field v-model="email" type="email" :message="errors.email" class="m-auto m-down-1_5" @keyup.enter="focusNext" />

    <div class="h3 m-down-col">{{ $t('Password') }}</div>
    <Field v-model="password" type="password" :message="errors.password" class="m-auto m-down-2" @keyup.enter="login" />

    <div v-if="submitError" class="m-down-1_5">
      <span class="font-small2 bg-error-heavy font-transparent m-end -circle"><Icon type="error" /></span>
      <span>{{ $t(submitError.text) }}</span>
    </div>

    <el-button type="primary" :disabled="hasError || isSubmitting" @click="login">
      {{ $t('Sign in') }}
    </el-button>
  </div>
</template>


<script>
import { reactive, toRefs, toRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import useSubmitter from '../../composables/useSubmitter';
import useValidate from '../../composables/useValidate';
import focusNext from '../../utils/focusNext';
import authStore from '../../../modules/auth/store';
import usersStore from '../../../modules/users/store';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    const data = reactive({
      email: '',
      password: '',
    });

    const { errors, hasError, validate } = useValidate({ data, schema: usersStore.validation });
    const { submit, isSubmitting, submitError } = useSubmitter();

    return {
      ...toRefs(data),
      errors,
      hasError,
      isSubmitting,
      submitError,

      focusNext,

      login: async () => {
        if (await validate()) {
          try {
            await submit(authStore.dispatch.login(toRaw(data)));
            const newRoute = (route.query?.route && decodeURIComponent(route.query.route)) || '/app';
            router.push(newRoute);
          } catch (err) {
            // The error is already in submitError.
          }
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
</style>
