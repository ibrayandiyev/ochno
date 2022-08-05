<template>
  <el-collapse-item>
    <template #title>
      <div class="drag-handle" />
      <h3 class="title-header">{{ $t('Send') }}</h3>
      <span class="title-header">{{ title }}</span>
    </template>

    <div class="mechanism-part-wrapper">
      <div class="mechanism-part">
        <PortSelect :model-value="$_.castArray(part.ids)" :port-ids="portIds" class="m-down" @input:model-value="setIds">
          {{ $t('Ports') }}
        </PortSelect>

        <div class="control-grid">
          <div class="-circle"><Icon type="vision" /></div>
          <div class="label">{{ $t('Action') }}</div>
          <Field type="select" multiple :model-value="dataValues" @input:model-value="setAction">
            <template #options>
              <el-option-group v-for="(values, key) in dataOptions" :key="key" :label="$t(key)">
                <el-option v-for="value in values" :key="value" :label="$t(`${key}.${value}`)" :value="`${key}.${value}`" />
              </el-option-group>
            </template>
            {{ $t('Select actions') }}
          </Field>
        </div>

        <div class="m-down">
          <template v-for="(props, device) in part.action" :key="device">
            <div class="m-up m-down-col">
              <div class="control-grid">
                <div class="-circle"><Icon :type="device" prefix="device" class="font-big1" /></div>
                <div class="bold">{{ $t(device) }}</div>
              </div>
            </div>

            <template v-for="(value, prop) in props" :key="device + prop">
              <div v-if="prop !== 'relative'" class="control-grid">
                <div class="-circle"><Icon :type="icon(device, prop)" /></div>
                <div class="label">{{ label(device, prop) }}</div>
                <Field type="text" :label="$t('Value')" :model-value="value" @update:model-value="setProp(device, prop, $event)" />
              </div>
            </template>
          </template>
        </div>

        <el-collapse v-if="showActionOption" v-model="expanded" :accordion="true" class="-minimal">
          <el-collapse-item name="options">
            <template #title>
              <div class="bg-gray-4">{{ $t('Options') }}</div>
            </template>

            <div>
              <div class="auto-fr-grid">
                <div>{{ $t('Make action relative to current value') }}</div>
                <div class="text-right">
                  <el-switch :value="part.options && part.options.relative" @input="setRelative" />
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </el-collapse-item>
</template>


<script>
import i18next from 'i18next';
import _ from 'lodash';
import { ref, computed } from 'vue';

import PortSelect from '../../ports/PortSelect.vue';
import { settings, typeProperties } from '../../../utils/deviceTypeProperties';
import portsStore from '../../../../modules/ports/store';
import workspaceStore from '../../../../modules/workspace/store';
import { BUTTON, ACTIVE_PORT } from '../../../../modules/ports/info/button';
import { DIMMER } from '../../../../modules/ports/info/dimmer';
import { FAN, TARGET_KEYS } from '../../../../modules/ports/info/fan';
import { LAMP, LAMP_KEYS } from '../../../../modules/ports/info/lamp';
import { SENSOR } from '../../../../modules/ports/info/sensor';

export const TYPE = 'portAction';

const dataOptions = {
  [LAMP]: LAMP_KEYS,
  [FAN]: TARGET_KEYS,
  [BUTTON]: [ACTIVE_PORT],
};

const setupOptions = _.omit(dataOptions, BUTTON); // Let's not use a button port as a default picked object.

export function setup(parameters) {
  const { ids, action, actionValue = '', options, previous } = _.cloneDeep(parameters);

  let partIds = (previous && previous.ids) || ids || [];
  let partAction = (previous && previous.action) || action || {};

  if (!previous && partIds.length) { // Typically this is a first time setup situation.
    const { info } = portsStore.state;
    const { types, mapTypes, filterByType } = portsStore.getters;

    const deviceTypes = Object.keys(partAction);
    if (deviceTypes.length) { // A certain action is specified, let's pick those types of ports + empty ports.
      const devicePorts = _.flatten(deviceTypes.map((type) => filterByType.value({ portIds: partIds, type })));
      const emptyPorts = partIds.filter((id) => !_.get(info, `${id}.types`, []).length);
      partIds = _.uniq(devicePorts.concat(emptyPorts));
    } else { // No action was set, let's figure out best one.
      const typeMap = mapTypes.value(partIds);
      const filteredMap = _.pick(typeMap, Object.keys(setupOptions));
      const portIds = _.flatten(Object.values(filteredMap));
      const subtypes = types.value(portIds, 'subtypes');
      const propertiesMap = typeProperties(Object.keys(filteredMap), subtypes);
      Object.entries(setupOptions).forEach(([device, availableProps]) => {
        if (propertiesMap[device]) {
          const props = _.intersection(propertiesMap[device], availableProps).reduce((obj, prop) => ({ ...obj, [prop]: actionValue }), {});
          propertiesMap[device] = props;
        }
      });
      partAction = propertiesMap;
      // And let's filter away "data producers" from the portIds, in case this is a smart setup sequence.
      partIds = _.flatten(Object.values(_.omit(typeMap, BUTTON, DIMMER, SENSOR)));
    }
  }

  return {
    type: TYPE,
    ids: partIds,
    action: partAction,
    options,
  };
}

export default {
  components: { PortSelect },

  props: {
    part: { type: Object, required: true },
  },

  setup(props) {
    /* eslint-disable no-param-reassign,vue/no-mutating-props */
    const dataValues = computed(() => _.flatten(Object.entries(props.part.action || {}).map(([device, values]) => {
      const filteredValues = Object.keys(values).filter((datapoint) => datapoint !== 'relative');
      return filteredValues.map((datapoint) => `${device}.${datapoint}`);
    })));

    return {
      dataOptions,

      expanded: ref(props.part.options && Object.keys(props.part.options).length && 'options'),

      dataValues,
      portIds: workspaceStore.getters.portIds,

      title: computed(() => {
        const length = dataValues.value.length;
        if (length) {
          const portLength = _.castArray(props.part.ids).filter((id) => id).length;
          const splitted = dataValues.value.map((data) => data.split('.'));
          if (length === 1) {
            const device = i18next.t(splitted[0][0]);
            const property = i18next.t(dataValues.value[0]);
            return i18next.t('{{ device }} {{ property }} to {{ count }} port', { device, property, count: portLength });
          }

          const devices = _.uniq(splitted.map(([device]) => device));
          if (devices.length === 1) {
            const device = i18next.t(devices[0]);
            return i18next.t('{{ device }} action to {{ count }} port', { device, count: portLength });
          }
          return i18next.t('multiple actions to {{ count }} port', { count: portLength });
        }
        return '';
      }),

      showActionOption: computed(() => {
        const { options, action } = props.part || {};
        return (options && Object.keys(_.omit(options, 'activeMs')).length) || (action && Object.keys(action).length);
      }),

      icon(device, prop) {
        return _.get(settings, `${device}.${prop}.icon`, 'info');
      },

      label(device, prop) {
        return _.get(settings, `${device}.${prop}.label`);
      },

      setIds(ids) {
        props.part.ids = ids;
      },

      setAction(data) {
        if (!props.part.action) {
          props.part.action = {};
        }

        const object = data.reduce((obj, path) => _.set(obj, path, ''), {});
        const newAction = {};

        Object.entries(object).forEach(([device, properties]) => Object.entries(properties).forEach(([prop, value]) => {
          _.set(newAction, [device, prop], _.get(props.part, `action.${device}.${prop}`, value));
        }));

        props.part.action = newAction;
      },

      setProp(device, prop, value) {
        props.part.action[device][prop] = value;
      },

      setRelative(value) {
        if (!props.part.options) {
          props.part.options = {};
        }

        if (value) {
          props.part.options.relative = true;
        } else {
          delete props.part.options.relative;
          if (!Object.keys(props.part.options).length) {
            delete props.part.options;
          }
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.control-header {
  margin-bottom: calc(var(--row-gap) * -1.75);
}
</style>
