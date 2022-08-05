<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="admin-filter -common-height">
    <Field
      v-if="accounts"
      type="select"
      multiple
      :value="modelValue.accountIds"
      class="-quadratic -common-height -borderless bg-transparent"
      popper-class="-quadratic font-small1"
      icon="home"
      @input:model-value="modelValue.accountIds = $event"
    >
      <template #options>
        <el-option
          v-for="account in sort(accounts)"
          :key="account.id"
          :label="account.name"
          :value="account.id"
        />
      </template>
    </Field>

    <Field
      v-if="spaces"
      type="select"
      multiple
      :value="modelValue.spaceIds"
      class="-quadratic -common-height -borderless bg-transparent"
      popper-class="-quadratic font-small1"
      icon="map"
      @input:model-value="modelValue.spaceIds = $event"
    >
      <template #options>
        <el-option
          v-for="space in sort(spaces)"
          :key="space.id"
          :label="space.name"
          :value="space.id"
        />
      </template>
    </Field>

    <Field
      v-if="hubs"
      type="select"
      multiple
      :value="modelValue.hubIds"
      class="-quadratic -common-height -borderless bg-transparent"
      popper-class="-quadratic font-small1"
      icon="hub"
      @input:model-value="modelValue.hubIds = $event"
    >
      <template #options>
        <el-option
          v-for="hub in sort(hubs)"
          :key="hub.id"
          :label="hub.name"
          :value="hub.id"
        />
      </template>
    </Field>
  </div>
</template>


<script>
export default {
  props: {
    modelValue: { type: Object, required: true },
    accounts: { type: Object },
    spaces: { type: Object },
    hubs: { type: Object },
  },

  setup() {
    return {
      sort(collection, prop = 'name') {
        return Object.values(collection).slice().sort((first, second) => first[prop] >= second[prop]);
      },
    };
  },
};
</script>


<style scoped lang="less">
.admin-filter {
  display: inline-flex;
}
</style>
