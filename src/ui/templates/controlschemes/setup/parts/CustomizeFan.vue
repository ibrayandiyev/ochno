<template>
  <CustomizeGeneral :control="control">
    <div class="info-wrapper p-block">
      <div class="m-down">
        <h4>{{ $t('Fan customization') }}</h4>
        <div class="auto-fr-grid p-block">
          <div>{{ $t('Show spinning animations') }}</div>
          <el-switch :value="$_.get(control, 'parameters.customize.fan.animations')" @change="setCustomize('fan.animations', $event)" />
          <div>{{ $t('Show RPM graph') }}</div>
          <el-switch :value="$_.get(control, 'parameters.customize.fan.rpmGraph')" @change="setCustomize('fan.rpmGraph', $event)" />
        </div>
      </div>

      <CustomizeHeader :control="control" class="m-down" />
      <CustomizeSliders :control="control" />
    </div>
  </CustomizeGeneral>
</template>


<script>
import CustomizeGeneral from './CustomizeGeneral.vue';
import CustomizeHeader from '../CustomizeHeader.vue';
import CustomizeSliders from '../CustomizeSliders.vue';
import usePropertySetter, * as rest from '../usePropertySetter';

export default {
  ...rest,

  components: { CustomizeHeader, CustomizeGeneral, CustomizeSliders },

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
