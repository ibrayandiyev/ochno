<template>
  <div class="blueprint-setup absolute-cover bg-gray-2">
    <div class="absolute-cover">
      <Scrollbar>
        <el-button class="back-arrow absolute -square -common-height -borderless" @click="back(true)">
          <Icon type="arrow" />
        </el-button>

        <div class="header-info grid p-block bg-gray-2">
          <h3>{{ $t(blueprint.name) }}</h3>
          <div class="info">
            {{ $t(blueprint.description) }}
          </div>
        </div>

        <div class="mechanism-wrapper control-width">
          <PortSelect v-model="selectedIds" :port-ids="portIds">
            {{ $t('Smart setup') }}
          </PortSelect>

          <div class="text-center">
            <el-button @click="createMechanism">
              {{ $t('Setup') }}
            </el-button>
          </div>
        </div>
      </Scrollbar>
    </div>

    <transition name="slide-from-right">
      <MechanismItem v-if="mechanism" :setup-mechanism="mechanism" :setup-port-ids="selectedIds" @back="back" />
    </transition>
  </div>
</template>


<script>
import { ref, onUnmounted } from 'vue';

import MechanismItem from '../MechanismItem.vue';
import PortSelect from '../../ports/PortSelect.vue';
import workspaceStore from '../../../../modules/workspace/store';

export default {
  components: { MechanismItem, PortSelect },

  props: {
    blueprint: { type: Object, required: true },
  },

  emits: ['back'],

  setup(props, { emit }) {
    const selectedIds = ref([]);
    const mechanism = ref(null);

    const { space, portIds, activeChoice, activeChoiceGrouped } = workspaceStore.getters;

    const stopEditing = () => workspaceStore.dispatch.clear(['editing']);

    if (activeChoice.value.activeBy === 'selection' && activeChoiceGrouped.value.portIds) {
      selectedIds.value = activeChoiceGrouped.value.portIds;
    }

    onUnmounted(() => stopEditing());

    return {
      selectedIds,
      mechanism,

      portIds,

      createMechanism() {
        mechanism.value = props.blueprint.setup({ ids: selectedIds.value });
        mechanism.value.spaceId = space.value.id;
        stopEditing();
      },

      back(close) {
        mechanism.value = null;

        if (close) {
          emit('back', close !== true); // Ask parent to close as well if the parameter is filled with a string from a new item.
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.port-select {
  margin: var(--row-gap) 0 calc(var(--row-gap) * 1.5);
}
</style>
