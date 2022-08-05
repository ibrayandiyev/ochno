<template>
  <el-collapse-item>
    <template #title>
      <div class="drag-handle" />
      <h3 class="title-header">{{ $t('Trigger on') }}</h3>
      <span class="title-header">{{ title }}</span>
    </template>

    <div class="mechanism-part-wrapper">
      <div class="mechanism-part">
        <PortSelect :model-value="$_.castArray(part.ids)" :port-ids="portIds" class="m-down" @input:model-value="setIds">
          {{ $t('Ports') }}
        </PortSelect>

        <div class="control-grid">
          <div class="-circle"><Icon type="vision" /></div>
          <div class="label">{{ $t('Data') }}</div>
          <Field type="select" multiple :model-value="part.data" @input:model-value="setData">
            <template #options>
              <el-option-group v-for="(values, key) in dataOptions" :key="key" :label="$t(key)">
                <el-option v-for="value in values" :key="value" :label="$t(`${key}.${value}`)" :value="`${key}.${value}`" />
              </el-option-group>
            </template>
            {{ $t('Select triggers') }}
          </Field>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<script>
import i18next from 'i18next';
import _ from 'lodash';
import { computed } from 'vue';

import PortSelect from '../../ports/PortSelect.vue';
import portsStore from '../../../../modules/ports/store';
import workspaceStore from '../../../../modules/workspace/store';
import { BUTTON, BUTTON_KEYS, DATA, DATA_KEYS, DEVICE, DEVICE_KEYS, DIMMER, DIMMER_KEYS, FAN, FAN_KEYS, LAMP, LAMP_KEYS, POWER, POWER_KEYS, SENSOR, SENSOR_KEYS } from '../../../../modules/ports/info';

export const TYPE = 'onPortData';

const dataOptions = {
  [SENSOR]: SENSOR_KEYS,
  [DIMMER]: DIMMER_KEYS,
  [DATA]: DATA_KEYS,
  [POWER]: POWER_KEYS,
  [DEVICE]: DEVICE_KEYS,
  [BUTTON]: BUTTON_KEYS,
  [FAN]: FAN_KEYS,
  [LAMP]: LAMP_KEYS,
};

export function setup(parameters) {
  const { ids, data, previous } = _.cloneDeep(parameters);

  let partIds = (previous && previous.ids) || ids || [];
  const partData = (previous && previous.data) || data || [];

  if (!previous && partIds.length && partData.length) { // Typically this is a first time setup situation.
    const { filterByType } = portsStore.getters;
    const deviceTypes = _.uniq(partData.map((dat) => dat.split('.')[0]));
    partIds = _.uniq(_.flatten(deviceTypes.map((type) => filterByType.value({ portIds: partIds, type }))));
  }

  return {
    type: TYPE,
    ids: partIds,
    data: partData,
  };
}

export default {
  components: { PortSelect },

  props: {
    part: { type: Object, required: true },
  },

  setup(props) {
    /* eslint-disable no-param-reassign,vue/no-mutating-props */
    return {
      dataOptions,

      portIds: workspaceStore.getters.portIds,

      title: computed(() => {
        const { data, ids } = props.part;
        const length = data?.length;
        if (length) {
          const portLength = _.castArray(ids).filter((id) => id).length;
          const splitted = data.map((val) => val.split('.'));
          if (length === 1) {
            const device = i18next.t(splitted[0][0]);
            const property = i18next.t(data[0]);
            return i18next.t('{{ device }} {{ property }} from {{ count }} port', { device, property, count: portLength });
          }

          const devices = _.uniq(splitted.map(([device]) => device));
          if (devices.length === 1) {
            const device = i18next.t(devices[0]);
            return i18next.t('{{ device }} values from {{ count }} port', { device, count: portLength });
          }
          return i18next.t('multiple values from {{ count }} port', { count: portLength });
        }
        return '';
      }),

      setIds(ids) {
        props.part.ids = ids;
      },

      setData(data) {
        props.part.data = data;
      },
    };
  },
};
</script>


<style scoped lang="less">
</style>
