<template>
  <div>
    <h2 class="margin-block-row">Select input</h2>

    <div class="grid m-down" style="grid-template-columns: repeat(auto-fill, minmax(50px, 300px)); column-gap: 5rem; align-items: flex-start;">
      <div>
        <h3 class="margin-block-column">Single select</h3>
        <div class="grid">
          <Field v-model="selectValue" type="select" :options="['A som i apa', 'B som i banan', 'C som i Canasta']">
            Select field with simple options
          </Field>
          <Field type="select" filterable :options="['A som i apa', 'B som i banan', 'C som i Canasta']">
            Filterable select
          </Field>
          <Field v-model="valid" type="select" :options="['A som i apa', 'B som i banan', 'C som i Canasta']" :message="errors.valid">
            With validation
          </Field>
          <Field v-model="selectValue2" type="select" :options="['A som i apa', 'B som i banan', 'C som i Canasta']">
            Preselected
          </Field>
          <Field type="select">
            Empty select
          </Field>
          <Field type="select" :options="['A som i apa', 'B som i banan', 'C som i Canasta']" />
          <Field v-model="selectValue3" type="select" filterable icon="edit">
            Complicated options, icon, filterable
            <template #options>
              <el-option
                v-for="item in selectItems"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </template>
          </Field>
          <Field type="select" icon="loading" :options="selectOptions">
            Loading
          </Field>
          <Field type="select" class="look-disabled" style="max-width: unset">
            Disabled options (drop down available)
            <template #options>
              <el-option
                v-for="item in selectItems"
                :key="item.value"
                :value="item.value"
                :label="item.label"
                :disabled="true"
              />
            </template>
          </Field>
          <Field type="select" disabled label="Disabled" :options="['A som i apa', 'B som i banan', 'C som i Canasta']" />
        </div>
      </div>

      <div>
        <h3 class="margin-block-column">Multiple select</h3>
        <div class="grid">
          <Field type="select" multiple :options="selectOptions" style="max-width: 15rem">
            Multiple select
          </Field>
          <Field type="select" multiple filterable :options="selectOptions">
            Filterable multiple select
          </Field>
          <Field type="select" multiple icon="edit">
            One with icon and complex options
            <template #options>
              <el-option
                v-for="item in selectItems"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </template>
          </Field>
          <Field type="select" multiple class="look-disabled">
            Disabled options (drop down available)
            <template #options>
              <el-option
                v-for="item in selectItems"
                :key="item.value"
                :value="item.value"
                :label="item.label"
                :disabled="true"
              />
            </template>
          </Field>
          <Field type="select" multiple disabled :options="selectOptions">
            Disabled
          </Field>
        </div>
      </div>
    </div>

    <h3 class="margin-block-column">Style modifiers</h3>
    <div class="flex">
      <div class="m-end">
        <Field type="select" class="-circle" :options="selectOptions" />
        <Field type="select" class="-circle" icon="edit" :options="selectOptions" />
        <Field type="select" disabled class="-circle" icon="edit" :options="selectOptions" />
      </div>

      <div>
        <Field type="select" class="-quadratic" popper-class="-quadratic" :options="selectOptions">Squared select field</Field>
        <Field type="select" class="-square" popper-class="-quadratic" :options="selectOptions" />
        <Field type="select" class="-square" popper-class="-quadratic" icon="edit" :options="selectOptions" />
        <Field
          type="select"
          multiple
          class="-square"
          popper-class="-quadratic"
          icon="home"
          :options="selectOptions"
        />
        <Field
          type="select"
          disabled
          class="-square"
          popper-class="-quadratic"
          icon="edit"
          :options="selectOptions"
        />
      </div>

      <div>
        <Field type="select" class="-quadratic -common-height" popper-class="-quadratic" :options="selectOptions">Squared select field</Field>
        <Field type="select" class="-square -common-height" popper-class="-quadratic" :options="selectOptions" />
        <Field
          type="select"
          multiple
          class="-square -common-height"
          popper-class="-quadratic"
          icon="edit"
          :options="selectOptions"
        />
        <Field
          type="select"
          multiple
          class="-square -common-height"
          popper-class="-quadratic"
          icon="home"
          :options="selectOptions"
        />
      </div>
    </div>
  </div>
</template>


<script>
import { reactive, toRefs } from 'vue';
import { object as yupObject, string as yupString } from 'yup';

import useValidate from '../../composables/useValidate';

export default {
  setup() {
    const data = reactive({ valid: '' });

    const { errors } = useValidate({
      data,
      schema: yupObject({
        valid: yupString().required(),
      }),
    });

    return {
      ...toRefs(data),
      errors,

      selectValue: null,
      selectValue2: 'A som i apa',
      selectValue3: null,

      selectItems: [
        { value: 1, label: 'Ett' },
        { value: 2, label: 'Två' },
        { value: 3, label: 'Tre' },
      ],
      selectOptions: ['Andas', 'Blunda', 'Cirkulera'],
    };
  },
};
</script>


<style scoped lang="less">
.grid {
  row-gap: 0.5rem;
}
</style>
