<template>
  <el-collapse-item>
    <template #title>
      <div class="drag-handle" />
      <h3 class="title-header">{{ $t('Set state') }}</h3>
      <span class="title-header">{{ title }}</span>
    </template>

    <div class="mechanism-part-wrapper">
      <div class="mechanism-part">
        <div v-for="key in keys" :key="key" class="control-grid-key-value control-grid">
          <div class="label">{{ $t('Key') }}</div>
          <Field type="text" :model-value="key" @update:model-value="setKey(key, $event)" />
          <div class="label">{{ $t('Value') }}</div>
          <Field type="text" :model-value="part.set[key] || ''" @update:model-value="setValue(key, $event)" />
        </div>

        <div v-if="!keys.length" class="control-grid-key-value control-grid">
          <div class="label">{{ $t('Key') }}</div>
          <Field v-model="temp.key" type="text" @update:model-value="setKey('', $event)" />
          <div class="label">{{ $t('Value') }}</div>
          <Field v-model="temp.value" type="text" @update:model-value="setValue('', $event)" />
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<script>
import i18next from 'i18next';
import _ from 'lodash';
import { reactive, computed } from 'vue';

import prettify from './utils/prettify';

export const TYPE = 'setState';

export function setup(parameters) {
  const { set, previous } = _.cloneDeep(parameters);

  return {
    type: TYPE,
    set: set || _.get(previous, 'set', {}),
  };
}

export default {
  props: {
    part: { type: Object, required: true },
  },

  setup(props) {
    /* eslint-disable no-param-reassign,vue/no-mutating-props */
    const temp = reactive({
      key: undefined,
      value: undefined,
    });

    return {
      temp,

      title: computed(() => {
        const { set } = props.part;
        const length = set && Object.keys(set).length;
        if (length) {
          if (length === 1) {
            return Object.entries(set).map(([key, value]) => `${key} = ${prettify(value, { cleanState: true })}`)[0];
          }
          return i18next.t('{{ count }} variable', { count: length });
        }
        return '';
      }),

      keys: computed(() => Object.keys(props.part.set || {})),

      setKey(key, newKey) {
        const newValue = props.part?.set?.[key]?.replaceAll(`{state.${key}}`, `{state.${newKey}}`);
        props.part.set[newKey] = newValue;
        delete props.part.set[key];
      },

      setValue(key, value) {
        props.part.set[key] = value;
      },

      add() {
        const { key, value } = temp;
        if (key && value) {
          temp.key = undefined;
          temp.value = undefined;

          if (!props.part.set) {
            props.part.set = {};
          }

          props.part.set[key] = value;
        }
      },

      remove(key) {
        delete props.part.set[key];
      },
    };
  },
};
</script>


<style scoped lang="less">
</style>
