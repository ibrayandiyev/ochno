<template>
  <div>
    <h4>{{ $t('Slider customization') }}</h4>
    <div class="auto-fr-grid p-block">
      <div>{{ $t('Show master slider') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.controls.master') !== false" @change="setCustomize('controls.master', $event)" />
      <div>{{ $t('Collapse individual ports') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.controls.collapsed') !== false" @change="setCustomize('controls.collapsed', $event)" />
      <div>{{ $t('Vertical slider') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.controls.vertical')" @change="setCustomize('controls.vertical', $event)" />
      <div>{{ $t('Show icon') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.controls.icon') !== false" @change="setCustomize('controls.icon', $event)" />
      <div>{{ $t('Show label') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.controls.label') !== false" @change="setCustomize('controls.label', $event)" />
      <div>{{ $t('Show number') }}</div>
      <el-switch :value="$_.get(control, 'parameters.customize.controls.number') !== false" @change="setCustomize('controls.number', $event)" />
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
