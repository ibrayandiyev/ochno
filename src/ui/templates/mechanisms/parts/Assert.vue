<template>
  <el-collapse-item>
    <template #title>
      <div class="drag-handle" />
      <h3 class="title-header">{{ $t('If') }}</h3>
      <span class="title-header">{{ title }}</span>
    </template>

    <div class="mechanism-part-wrapper">
      <div class="mechanism-part">
        <div class="control-grid no-control-icon">
          <div class="-circle"><Icon type="info" /></div>
          <div class="label">{{ $t('Expression') }}</div>
          <Field type="text" :label="$t('Value')" :model-value="part.assert" @update:model-value="setAssert" />
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<script>
import _ from 'lodash';
import { computed } from 'vue';

import prettify from './utils/prettify';

export const TYPE = 'assert';

export function setup(parameters) {
  const { assert } = _.cloneDeep(parameters);

  return {
    type: TYPE,
    assert,
  };
}

export default {
  props: {
    part: { type: Object, required: true },
  },

  setup(props) {
    /* eslint-disable no-param-reassign,vue/no-mutating-props */
    return {
      title: computed(() => (props.part.assert ? prettify(props.part.assert) : '')),

      setAssert(value) {
        props.part.assert = value;
      },
    };
  },
};
</script>


<style scoped lang="less">
.field {
  max-width: none !important;
}
</style>
