<template>
  <div v-page-title="'Theme Preview'" :class="themeBg" class="theme">
    <div class="theme-bg">
      <Field v-model="themeBg" type="select" class="-circle bg-transparent" popper-class="-quadratic">
        <template #options>
          <el-option value="bg-black" label="bg-black" class="bg-black" />
          <el-option value="bg-gray-1" label="bg-gray-1" class="bg-gray-1" />
          <el-option value="bg-gray-2" label="bg-gray-2" class="bg-gray-2" />
          <el-option value="bg-gray-3" label="bg-gray-3" class="bg-gray-3" />
        </template>
      </Field>
    </div>

    <h1 class="theme-header color-primary">ATOMS</h1>
    <ThemeColor class="theme-section p-block" />
    <ThemeIcon class="theme-section p-block" />
    <ThemeHeader class="theme-section p-block" />
    <ThemeShape class="theme-section p-block" />

    <h1 class="theme-header color-primary">BASIC COMPONENTS</h1>
    <ThemeButton class="theme-section p-block" />
    <ThemeOnOff class="theme-section p-block" />
    <ThemeField class="theme-section p-block" />
    <ThemeSelect class="theme-section p-block" />
    <ThemeSlider class="theme-section p-block" />

    <h1 class="theme-header color-primary">COMPOUND COMPONENTS</h1>
    <ThemeMessage class="theme-section p-block" />
    <ThemeDateTimePicker class="theme-section p-block" />
    <ThemePane class="theme-section p-block" />
    <ThemeJSONEditor class="theme-section p-block" />
    <ThemeChart class="theme-section p-block" />
    <ThemeUploader class="theme-section p-block" />

    <h1 class="theme-header color-primary">LAYOUTS</h1>
    <ThemeTabs class="theme-section p-block" />
    <ThemeAdjustable class="theme-section p-block" />
  </div>
</template>


<script>
import { ref } from 'vue';

import ThemeAdjustable from './ThemeAdjustable.vue';
import ThemeButton from './ThemeButton.vue';
import ThemeChart from './ThemeChart.vue';
import ThemeColor from './ThemeColor.vue';
import ThemeDateTimePicker from './ThemeDateTimePicker.vue';
import ThemeField from './ThemeField.vue';
import ThemeHeader from './ThemeHeader.vue';
import ThemeIcon from './ThemeIcon.vue';
import ThemeJSONEditor from './ThemeJSONEditor.vue';
import ThemeMessage from './ThemeMessage.vue';
import ThemeOnOff from './ThemeOnOff.vue';
import ThemePane from './ThemePane.vue';
import ThemeSelect from './ThemeSelect.vue';
import ThemeShape from './ThemeShape.vue';
import ThemeSlider from './ThemeSlider.vue';
import ThemeTabs from './ThemeTabs.vue';
import ThemeUploader from './ThemeUploader.vue';

export default {
  components: {
    ThemeAdjustable,
    ThemeButton,
    ThemeChart,
    ThemeColor,
    ThemeDateTimePicker,
    ThemeField,
    ThemeHeader,
    ThemeIcon,
    ThemeJSONEditor,
    ThemeMessage,
    ThemeOnOff,
    ThemePane,
    ThemeSelect,
    ThemeShape,
    ThemeSlider,
    ThemeTabs,
    ThemeUploader,
  },

  setup() {
    return {
      themeBg: ref('bg-gray-2'),
    };
  },
};
</script>


<style scoped lang="less">
.theme {
  :deep(.margin-block-row) {
    margin-block: var(--row-gap);
  }

  :deep(.margin-block-column) {
    margin-block: var(--column-gap);
  }
}

.theme-bg {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1;
}

.theme-header {
  padding: 4rem 0 2rem;
  text-align: center;
}

.theme-section {
  padding-inline: max(var(--column-gap), 10%);

  &:nth-child(2n) {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
