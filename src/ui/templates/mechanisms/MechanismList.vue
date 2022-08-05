<template>
  <div class="mechanism-list color-primary-inverted">
    <div class="absolute-cover">
      <Scrollbar>
        <Spinner v-if="fetching" />

        <div class="p-down">
          <template v-if="!selected || selectedMechanism">
            <div v-for="mech in mechanisms" :key="mech.id" class="mechanism-grid grid row-lines-inner p-start -common-height" @click="selected = mech.id">
              <MechanismIcons :parts="mech.parts" :limit="3" />
              <div style="justify-self: start">{{ title(mech.id) }}</div>
              <Icon type="arrow" />
            </div>

            <div class="text-center m-up">
              <el-button @click="() => createNew = true">
                <div class="auto-fr-grid">
                  <Icon type="add" />
                  <span>{{ $t('Create new mechanism') }}</span>
                </div>
              </el-button>
            </div>
          </template>
        </div>
      </Scrollbar>
    </div>

    <transition name="slide-from-right">
      <MechanismItem v-if="selectedMechanism" :mechanism-id="selected" @back="noSelection" />
      <NewMechanism v-else-if="createNew" @back="() => createNew = false" />
    </transition>
  </div>
</template>


<script>
import { ref, computed, watch, onUnmounted } from 'vue';

import MechanismIcons from './MechanismIcons.vue';
import MechanismItem from './MechanismItem.vue';
import NewMechanism from './NewMechanism.vue';
import mechanismsStore from '../../../modules/mechanisms/store';
import workspaceStore from '../../../modules/workspace/store';

export default {
  components: { MechanismIcons, MechanismItem, NewMechanism },

  setup() {
    const selected = ref('');
    const createNew = ref('');

    const { mechanisms } = workspaceStore.getters;

    const noSelection = () => {
      selected.value = '';
    };

    watch(
      () => mechanisms.value,
      (newValue) => !newValue.find(({ id }) => id === selected.value) && noSelection(),
    );

    onUnmounted(() => workspaceStore.dispatch.clear(['editing', 'highlighting']));

    return {
      selected,
      createNew,

      mechanisms,
      title: mechanismsStore.getters.title,
      fetching: computed(() => mechanismsStore.state.fetching),
      selectedMechanism: computed(() => selected.value && mechanisms.value.find(({ id }) => id === selected.value)),

      noSelection,
    };
  },
};
</script>


<style scoped lang="less">
.mechanism-grid {
  grid-template-columns: calc(var(--common-size) * 1.2) 1fr var(--common-size);
  justify-items: center;
  cursor: pointer;
  margin-top: 0;

  &:hover {
    color: rgb(var(--color-nature));
  }
}
</style>
