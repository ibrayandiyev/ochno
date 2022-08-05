<template>
  <div>
    <h2 class="margin-block-row">Input fields</h2>

    <div class="grid m-down" style="grid-template-columns: repeat(auto-fill, minmax(50px, 300px)); column-gap: 5rem; align-items: flex-start;">
      <div class="grid">
        <Field v-model="field">Input field</Field>
        <Field v-model="field" type="password">Password field</Field>
        <Field type="number" :min="7" :max="777">7 - 777</Field>
      </div>
      <div class="grid m-none">
        <Field v-model="field" icon="edit">With icon</Field>
        <Field v-model="field" icon="loading">Loading icon</Field>
        <Field v-model="field" icon="add" class="compact">Compact field</Field>
        <Field v-model="field" disabled>Disabled</Field>
      </div>
      <div class="grid m-none">
        <Field v-model="valid" :message="errors.valid">Field validation</Field>
        <Field v-model="email" type="email" :message="errors.email">Email form</Field>
        <Field v-model="password" type="password" :message="errors.password">Password form</Field>
        <el-button :disabled="hasError">Submit</el-button>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, reactive, toRefs } from 'vue';
// https://github.com/jquense/yup
import { object as yupObject, string as yupString } from 'yup';

import useValidate from '../../composables/useValidate';

export default {
  setup() {
    const data = reactive({ valid: '', email: '', password: '' });

    // Composable also returns a "validate" function to be used when submitting stuff.
    const { errors, hasError } = useValidate({
      data,
      schema: yupObject({
        valid: yupString().required().min(4).max(6),
        email: yupString().required().email().label('Email'),
        password: yupString().required().min(8).label('Password'),
      }),
    });

    return {
      field: ref(null),

      ...toRefs(data),
      errors,
      hasError,
    };
  },
};
</script>


<style scoped lang="less">
.grid {
  row-gap: 0.5rem;
}
</style>
