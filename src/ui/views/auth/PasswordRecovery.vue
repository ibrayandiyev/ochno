<template>
  <div class="relative">
    <Spinner v-if="isSubmitting" class="fill centered" />

    <h1 class="m-down-common">{{ $t('Password recovery') }}</h1>

    <div class="h3 m-down-col">{{ $t('Email') }}</div>
    <Field v-model="email" type="email" :message="errors.email" class="m-auto m-down-2" @keyup.enter="recovery" />

    <div v-if="submitError" class="m-down-1_5">
      <span class="font-small2 bg-error-heavy font-transparent m-end -circle"><Icon type="error" /></span>
      <span class="text-left">{{ $t(submitError.text) }}</span>
    </div>

    <el-button type="primary" :disabled="hasError || isSubmitting" @click="recovery">
      {{ $t('Send recovery mail') }}
    </el-button>

    <div v-if="message" class="m-up-2">
      <span class="font-small2 m-end -circle"><Icon type="info" /></span>
      <span class="text-left">{{ $t(message) }}</span>
    </div>
  </div>
</template>


<script>
import { ref, reactive, toRefs, toRaw } from 'vue';

import useSubmitter from '../../composables/useSubmitter';
import useValidate from '../../composables/useValidate';
import authStore from '../../../modules/auth/store';
import usersStore from '../../../modules/users/store';

const schema = usersStore.validation.pick(['email']);

export default {
  setup() {
    const data = reactive({
      email: '',
    });
    const message = ref('');

    const { errors, hasError, validate } = useValidate({ data, schema });
    const { submit, isSubmitting, submitError } = useSubmitter();

    return {
      ...toRefs(data),
      message,
      errors,
      hasError,
      isSubmitting,
      submitError,

      recovery: async () => {
        if (await validate()) {
          try {
            message.value = '';
            const retval = await submit(authStore.dispatch.forgot(toRaw(data)));
            message.value = retval.message;
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
