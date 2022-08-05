<template>
  <CustomizeGeneral :control="control">
    <div class="info-wrapper p-block">
      <div class="control-grid">
        <div class="-circle"><Icon type="edit" /></div>
        <div class="label">{{ $t('Text') }}</div>
        <Field type="textarea" :model-value="$_.get(control, 'parameters.html')" @update:model-value="setParameter('html', $event)">
          Custom text
        </Field>

        <div class="-circle"><Icon type="edit" /></div>
        <div class="label">{{ $t('Align text') }}</div>
        <Field type="select" :model-value="$_.get(control, 'style.[text-align]')" @update:model-value="setStyle('text-align', $event)">
          <template #options>
            <el-option :label="$t('Left')" value="left" />
            <el-option :label="$t('Center')" value="center" />
            <el-option :label="$t('Right')" value="right" />
          </template>
          {{ $t('Left') }}
        </Field>
      </div>
    </div>
  </CustomizeGeneral>
</template>


<script>
import CustomizeGeneral from './CustomizeGeneral.vue';
import usePropertySetter, * as rest from '../usePropertySetter';

export default {
  ...rest,

  components: { CustomizeGeneral },

  setup(props) {
    const { setProperty, setParameter } = usePropertySetter(props);

    return {
      setParameter,

      setStyle(prop, value) {
        if (value !== 'left') {
          setProperty(`style.${prop}`, value);
        } else if (props.control.style) {
          delete props.control.style[prop]; // eslint-disable-line no-param-reassign
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.control-grid {
  align-items: start;

  .label {
    line-height: 3.5rem;
  }
}
</style>
