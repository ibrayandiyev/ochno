<template>
  <div>
    <h4>{{ $t('Header customization') }}</h4>
    <div class="auto-fr-grid p-block">
      <div>{{ $t('Show icon') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.header.icon') !== false" @change="setCustomize('header.icon', $event)" />
      <div>{{ $t('Show port count') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.header.count') !== false" @change="setCustomize('header.count', $event)" />
      <div>{{ $t('Show text') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.header.text') !== false" @change="setCustomize('header.text', $event)" />
    </div>
  </div>
</template>


<script>
import usePropertySetter, * as rest from './usePropertySetter';

export default {
  ...rest,

  setup(props) {
    return {
      ...usePropertySetter(props),
    };
  },
};
</script>


<style scoped lang="less">
.auto-fr-grid {
  row-gap: var(--column-gap);
  padding-top: var(--column-gap);
  padding-bottom: var(--column-gap);
}
.el-switch {
  justify-self: flex-end;
}
</style>
