<template>
  <div class="port-select control-grid">
    <div class="-circle"><Icon type="port" /></div>
    <div class="label">
      <slot>{{ $t('Ports') }}</slot>
    </div>
    <div class="grid">
      <Field type="select" multiple :model-value="modelValue" @input:model-value="emit('input:modelValue', $event)">
        <template #options>
          <PortSelectOption v-for="portId in portIds" :key="portId" :port-id="portId" />
        </template>
        {{ fieldText }}
      </Field>
      <MapSelect :item-ids="modelValue" @ports-change="emit('input:modelValue', $event)" />
    </div>
  </div>
</template>


<script>
import i18next from 'i18next';

import PortSelectOption from './PortSelectOption.vue';
import MapSelect from '../../components/MapSelect.vue';

export default {
  components: { MapSelect, PortSelectOption },

  props: {
    modelValue: { type: Array },
    portIds: { type: Array, default: () => [] },
    fieldText: { type: String, default: i18next.t('Select ports') },
  },

  emits: ['input:modelValue'],

  setup(props, { emit }) {
    return {
      emit,
    };
  },
};
</script>


<style scoped lang="less">
.grid {
  grid-template-columns: 1fr auto;
  justify-items: flex-end;
}
</style>
