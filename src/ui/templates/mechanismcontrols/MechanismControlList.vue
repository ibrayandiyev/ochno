<template>
  <div class="mechanism-controls-list">
    <div class="absolute-cover">
      <Scrollbar>
        <Spinner v-if="fetching" />

        <div class="p-down">
          <div v-for="id in filteredControlIds" :key="id" class="relative control-width">
            <ControlMechanismBuilder :mechanism-control-id="id" :mechanism-ids="mechanismIds" />
            <el-button class="edit-button -square -borderless" @click="selected = id"><Icon type="edit" /></el-button>
          </div>

          <DashedLine class="m-block" />

          <el-button class="flex m-auto" @click="() => createNew = {}">
            <div class="auto-fr-grid fill-height">
              <Icon type="add" />
              <span>{{ $t('Create new control') }}</span>
            </div>
          </el-button>
        </div>
      </Scrollbar>
    </div>

    <transition name="slide-from-right">
      <MechanismControl v-if="selected" :mechanism-control-id="selected" @back="noSelection" />
      <MechanismControl v-else-if="createNew" :setup-mechanism-control="createNew" @back="() => createNew = null" />
    </transition>
  </div>
</template>


<script>
import { ref, computed, watch } from 'vue';

import MechanismControl from './MechanismControl.vue';
import ControlMechanismBuilder from './controls/ControlMechanismBuilder.vue';
import DashedLine from '../../components/DashedLine.vue';
import mechanismControlsStore from '../../../modules/mechanismcontrols/store';
import workspaceStore from '../../../modules/workspace/store';

export default {
  components: { MechanismControl, ControlMechanismBuilder, DashedLine },

  setup() {
    const selected = ref('');
    const createNew = ref('');

    const { filtered } = mechanismControlsStore.getters;
    const { mechanisms } = workspaceStore.getters;

    const mechanismIds = computed(() => mechanisms.value.map(({ id }) => id));
    const filteredControlIds = computed(() => filtered.value({ mechanismIds: mechanismIds.value }).map(({ id }) => id));

    const noSelection = () => {
      selected.value = '';
    };

    watch(
      () => mechanismControlsStore.state.mechanismControls,
      (newValue) => !newValue[selected.value] && noSelection(),
    );

    return {
      selected,
      createNew,

      mechanismIds,
      filteredControlIds,
      fetching: computed(() => mechanismControlsStore.state.fetching),

      noSelection,
    };
  },
};
</script>


<style scoped lang="less">
.edit-button {
  position: absolute;
  top: var(--common-size);
  right: var(--column-gap);
  transform: translateY(-50%;)
}
</style>
