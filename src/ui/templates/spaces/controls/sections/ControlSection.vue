<template>
  <div class="control-section control-grid">
    <div class="-circle"><Icon type="section" /></div>
    <Field :model-value="section.name" @update:model-value="updateName">{{ $t('Section name') }}</Field>
    <el-tooltip placement="top" :content="$t('Remove from space')">
      <el-button class="-square -borderless" @click="removeSection()"><Icon type="bin" /></el-button>
    </el-tooltip>
  </div>
</template>

<script>
import _ from 'lodash';
import { computed } from 'vue';

import useSave from '../../../../composables/useSave';
import spacesStore from '../../../../../modules/spaces/store';
import workspaceStore from '../../../../../modules/workspace/store';

export default {
  props: {
    sectionId: { type: String, required: true },
    space: { type: Object, required: true },
  },

  setup(props) {
    const save = useSave({ actual: computed(() => props.space), store: spacesStore });
    const spaceSection = computed(() => save.item?.items?.find((item) => item.id === props.sectionId));

    return {
      updateName(name) {
        if (spaceSection.value?.name !== name) {
          spaceSection.value.name = name;
          save.saveItem();
        }
      },

      removeSection() {
        const index = _.findIndex(save.item?.items, (item) => item.id === props.sectionId);
        if (index >= 0) {
          workspaceStore.dispatch.unselect({ itemIds: props.sectionId });
          save.item.items.splice(index, 1);
          save.saveItem();
        }
      },
    };
  },
};
</script>

<style scoped lang="less">
.control-grid {
  grid-template-columns: auto 1fr auto;
}

.field {
  max-width: unset;
}
</style>
