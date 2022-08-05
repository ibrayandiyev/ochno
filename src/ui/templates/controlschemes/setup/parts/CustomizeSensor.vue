<template>
  <CustomizeGeneral :control="control">
    <div class="info-wrapper p-block">
      <div class="m-down">
        <h4 class="m-down">{{ $t('Sensor customization') }}</h4>

        <div class="control-grid">
          <div class="-circle"><Icon type="vision" /></div>
          <div class="label">{{ $t('Show') }}</div>
          <Field type="select" multiple :model-value="$_.get(control, 'parameters.paths')" @input:model-value="setPaths">
            <template #options>
              <el-option v-for="key in SENSOR_KEYS" :key="key" :label="$t(`sensor.${key}`)" :value="key" />
            </template>
            {{ $t('All values') }}
          </Field>
        </div>

        <div class="auto-fr-grid m-down">
          <div>{{ $t('Show real time graph') }}</div>
          <el-switch :value="$_.get(control, 'parameters.customize.sensor.graph') !== false" @change="setCustomize('sensor.graph', $event)" />
          <div>{{ $t('Show latest value') }}</div>
          <el-switch :value="$_.get(control, 'parameters.customize.sensor.latest')" @change="setCustomize('sensor.latest', $event)" />
        </div>
      </div>

      <CustomizeHeader :control="control" class="m-down" />
    </div>
  </CustomizeGeneral>
</template>


<script>
import CustomizeGeneral from './CustomizeGeneral.vue';
import CustomizeHeader from '../CustomizeHeader.vue';
import usePropertySetter, * as rest from '../usePropertySetter';
import { SENSOR_KEYS } from '../../../../../modules/ports/info/sensor';

export default {
  ...rest,

  components: { CustomizeHeader, CustomizeGeneral },

  setup(props) {
    const { setParameter, setCustomize } = usePropertySetter(props);

    return {
      SENSOR_KEYS,

      setCustomize,

      setPaths(value) {
        if (value) {
          setParameter('paths', value);
        } else if (props.control.parameters) {
          delete props.control.parameters.paths; // eslint-disable-line no-param-reassign
        }
      },
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
