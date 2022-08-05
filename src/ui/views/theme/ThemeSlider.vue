<template>
  <div>
    <h2 class="margin-block-row">Sliders</h2>

    <h3 class="margin-block-column">Straight</h3>
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(20rem, 30rem)); column-gap: 5rem; align-items: flex-start;">
      <div>
        <el-slider v-model="slider" style="width: 10rem;" @change="() => {}" />
        <el-slider v-model="slider" disabled style="width: 10rem;" />
      </div>
      <div>
        <el-slider v-model="slider" vertical style="height: 10rem;" @change="() => {}" />
        <el-slider v-model="slider" vertical disabled style="height: 10rem;" />
      </div>
    </div>

    <h3 class="margin-block-column">Circular</h3>
    <div>
      <div style="display: inline-block">
        <CircularSlider :start="slider" class="font-bigger" @change="sliderChange" />
      </div>
      <div style="display: inline-block">
        <div>rotation</div>
        <CircularSlider :start="slider" :rotation="0" :knob-width="5" class="font-bigger" @change="sliderChange" />
      </div>
      <div style="display: inline-block">
        <div>gap, color</div>
        <!-- For color: use styling, see the rule '.slider-color' below. -->
        <CircularSlider :start="slider" :rotation="135" :gap="0.25" class="slider-color font-bigger" @change="sliderChange" />
      </div>
      <div style="display: inline-block">
        <div>values</div>
        <CircularSlider :start="slider" :values="[0, 1, 2, 10]" class="font-bigger" @change="sliderChange" />
      </div>
      <div style="display: inline-block">
        <div>values, gap</div>
        <CircularSlider
          :start="slider"
          :values="[1, 2, 3]"
          :rotation="147"
          :gap="0.33"
          :wrap="true"
          class="font-bigger"
          @change="sliderChange"
        />
      </div>
      <div style="display: inline-block">
        <div>text values</div>
        <CircularSlider :values="['red', 'green', 'blue']" :rotation="180" :gap="0.5" :wrap="true" class="font-bigger" />
      </div>
      <div style="display: inline-block">
        <div>Disabled</div>
        <CircularSlider disabled :start="slider" class="font-bigger" @change="sliderChange" />
      </div>
    </div>

    <div>
      <div style="display: inline-block">
        <div>big color wheel</div>
        <CircularSlider :wrap="true" :size="200" :width="7.7" :knob-width="5" class="color-wheel font-bigger" />
      </div>
      <div style="display: inline-block">
        <div>small color wheel</div>
        <CircularSlider :wrap="true" :size="50" class="color-wheel" />
      </div>
    </div>
  </div>
</template>


<script>
import { ref } from 'vue';

import CircularSlider from '../../components/CircularSlider.vue';

export default {
  components: { CircularSlider },

  setup() {
    const slider = ref(0);

    return {
      slider,
      sliderChange(value) {
        slider.value = value;
      },
    };
  },
};
</script>


<style scoped lang="less">
.slider-transparent {
 :deep(.el-slider__bar) {
    background-color: transparent;
  }
}

.slider-color {
 :deep(.arc) {
    stroke: firebrick;
  }
}

// Special class for making a pretty color wheel.
.color-wheel {
  // This graphics should be smaller (less space) and with a thicker stroke (to cover the knob).
  background-image: url('./Ochno-Led-88.png');

  .track,
  .arc {
    stroke: none;
  }
}
</style>
