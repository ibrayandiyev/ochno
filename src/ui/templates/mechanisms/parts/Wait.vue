<template>
  <el-collapse-item>
    <template #title>
      <div class="drag-handle" />
      <h3 class="title-header">{{ $t('Wait') }}</h3>
      <span class="title-header">{{ title }}</span>
    </template>

    <div class="mechanism-part-wrapper">
      <div class="mechanism-part">
        <div class="control-grid">
          <div class="-circle"><Icon type="clock" /></div>
          <div class="label">{{ $t('Time') }}</div>
          <div class="number-grid grid">
            <Field type="number" :min="1" :max="Number.POSITIVE_INFINITY" :model-value="milliToMin(part.ms)" @update:model-value="setMS" />
            <div class="font-capitalize">{{ $t(unit, { count: number }) }}</div>
            <!-- <Field type="select" :modelValue="" v-on:input:modelValue="setData">
              <template v-slot:options>
                <el-option-group v-for="(values, key) in portData" :key="key" :label="$t(key)">
                  <el-option v-for="value in values" :key="value" :label="`${key}.${value}`" :value="`${key}.${value}`" />
                </el-option-group>
              </template>
            </Field> -->
          </div>

          <div />
          <div class="label">{{ $t('Behavior') }}</div>
          <Field type="select" :model-value="part.behavior || behaviors[0].value" @update:model-value="setBehavior">
            <template #options>
              <el-option v-for="behavior in behaviors" :key="behavior.value" :label="behavior.label" :value="behavior.value" />
            </template>
            {{ $t('Select behavior') }}
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

export const TYPE = 'wait';

const behaviors = [
  { value: 'trailing', label: i18next.t('Triggers reset time, last trigger runs') },
  { value: 'leading', label: i18next.t('First trigger runs, triggers reset time') },
  { value: 'always', label: i18next.t('Every trigger waits, then runs') },
];

const minuteInMs = 60 * 1000;

function minToMilli(number) {
  return number * minuteInMs;
}

function milliToMin(number) {
  return number / minuteInMs;
}

export function setup(parameters) {
  const { ms, behavior, previous } = _.cloneDeep(parameters);

  return {
    type: TYPE,
    ms: ms || _.get(previous, 'ms', minToMilli(15)),
    behavior: behavior || _.get(previous, 'behavior'),
  };
}

export default {
  props: {
    part: { type: Object, required: true },
  },

  setup(props) {
    /* eslint-disable no-param-reassign,vue/no-mutating-props */
    const unit = 'minute';

    const number = computed(() => milliToMin(props.part.ms));

    return {
      behaviors,
      unit,

      number,
      title: computed(() => {
        if (props.part.ms) {
          return i18next.t(`{{ count }} ${unit}`, { count: number.value });
        }
        return '';
      }),

      milliToMin,
      setMS(value) {
        props.part.ms = minToMilli(value);
      },

      setBehavior(value) {
        props.part.behavior = value;
      },
    };
  },
};
</script>


<style scoped lang="less">
.number-grid {
  grid-template-columns: 6em auto;
  justify-self: end;
}
</style>
