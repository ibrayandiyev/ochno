<template>
  <!-- See less file "grids.less" for more information. -->
  <div class="control-grid-extra control-grid" :class="{ 'vertical-grid': vertical, 'inline-grid': vertical }">
    <div class="-circle"><Icon :type="icon" /></div>
    <div class="label">{{ label }}</div>

    <el-slider
      ref="elSlider"
      v-model="model"
      :min="min"
      :max="max"
      :class="slider || ''"
      :vertical="vertical"
      @input="elSlider.dragging && emit($event)"
      @change="emit($event)"
    />

    <Field
      type="number"
      :model-value="fixedValue"
      :min="min"
      :max="max"
      class="number"
      @update:model-value="emit($event)"
    />
  </div>
</template>


<script>
import _ from 'lodash';
import { ref, computed, watchEffect } from 'vue';

import toFixed from '../utils/toFixed';

export default {
  props: {
    value: { type: Number },
    prop: { type: String },

    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    icon: { type: String, default: '' },
    slider: { type: String, default: '' },
    label: { type: String, default: '' },
    vertical: { type: Boolean },
    debounce: { type: Number, default: 0 },
  },

  emits: ['input'],

  setup(props, { emit }) {
    const model = ref(props.value);

    const emitter = (value) => emit('input', { prop: props.prop, value });

    watchEffect((newValue) => {
      model.value = newValue;
    });

    return {
      model,
      elSlider: ref(null),

      fixedValue: computed(() => toFixed(props.value)),

      emit: props.debounce ? _.debounce(emitter, props.debounce) : emitter,
    };
  },
};
</script>


<style scoped lang="less">
.temp-slider:deep(.el-slider__runway) {
  &:before {
    background-image: linear-gradient(to right, rgba(var(--color-orange), 0.8), rgb(var(--color-nature)));
  }

  .el-slider__button {
    background-color: rgb(var(--color-nature));
  }
}

.vertical-grid {
  .el-slider {
    height: 14rem;
  }

  .temp-slider:deep(.el-slider__runway) {
    &:before {
      background-image: linear-gradient(to top, rgba(var(--color-orange), 0.8), rgb(var(--color-nature)));
    }
  }
}
</style>
