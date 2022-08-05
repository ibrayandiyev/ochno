<template>
  <CustomizeGeneral :control="control">
    <div class="info-wrapper p-block">
      <Upload
        accept="image/*"
        class="grid m-down"
        :image="$_.get(control, 'parameters.url')"
        :disabled="isUploading"
        :uploading="isUploading"
        @input="upload"
        @remove="setParameter('url', '')"
      />

      <div class="size-grid control-grid">
        <Field :model-value="$_.get(control, 'style[max-width]')" @update:model-value="setStyle('max-width', $event)">
          {{ $t('Max width') }}
        </Field>

        <div class="label">×<!-- Multiplication sign --></div>
        <Field :model-value="$_.get(control, 'style[max-height]')" @update:model-value="setStyle('max-height', $event)">
          {{ $t('Max height') }}
        </Field>
      </div>

      <div class="control-grid">
        <div class="-circle"><Icon type="cursor" /></div>
        <div class="label">{{ $t('Link') }}</div>
        <Field :model-value="$_.get(control, 'parameters.link')" @update:model-value="setParameter('link', $event)" />
      </div>
    </div>
  </CustomizeGeneral>
</template>


<script>
import { ref } from 'vue';

import CustomizeGeneral from './CustomizeGeneral.vue';
import usePropertySetter, * as rest from '../usePropertySetter';
import Upload from '../../../../components/Upload.vue';
import { showError } from '../../../../utils/error';
import controlSchemesStore from '../../../../../modules/controlschemes/store';

// https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
const styleSizeRegex = /(%|px|pt|pc|vw|vh|vmin|vmax|rem|em|ex|ch|lh|cm|mm|in)/i;

export default {
  ...rest,

  components: { CustomizeGeneral, Upload },

  setup(props) {
    const isUploading = ref(false);
    const { setProperty, setParameter } = usePropertySetter(props);

    return {
      isUploading,

      setParameter,

      setStyle(prop, value) {
        if (value) {
          const unit = value.match(styleSizeRegex)?.[0] || 'px';
          const number = Number.parseFloat(value) || 0;
          setProperty(`style.${prop}`, `${number}${unit}`);
        } else if (props.control.style) {
          delete props.control.style[prop]; // eslint-disable-line no-param-reassign
        }
      },

      async upload(data) {
        isUploading.value = true;
        try {
          const value = await controlSchemesStore.dispatch.postImage({ data });
          isUploading.value = false;
          setParameter('url', value.url);
        } catch (error) {
          isUploading.value = false;
          showError(error);
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.upload {
  max-height: var(--common-size);
}

.size-grid {
  grid-template-columns: 1fr auto 1fr;
}

.no-control-label .size-grid {
  grid-template-columns: 1fr 1fr;
}
</style>
