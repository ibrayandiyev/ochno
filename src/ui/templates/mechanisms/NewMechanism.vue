<template>
  <div class="new-mechanism absolute-cover bg-gray-2">
    <div class="absolute-cover">
      <Scrollbar>
        <el-button class="back-arrow absolute -square -common-height -borderless" @click="back(true)">
          <Icon type="arrow" />
        </el-button>

        <div class="header-info grid p-block bg-gray-2">
          <h3>{{ $t('Create new mechanism') }}</h3>
          <div class="info">
            {{ $t('Select blueprint') }}
          </div>
        </div>

        <div class="mechanism-wrapper control-width grid" style="justify-content: center;">
          <div v-for="bp in blueprints" :key="bp.name" class="text-center">
            <el-button @click="() => selected = bp">
              {{ bp.name }}
            </el-button>
          </div>
        </div>
      </Scrollbar>
    </div>

    <transition name="slide-from-right">
      <BlueprintSetup v-if="selected" :blueprint="selected" @back="back" />
    </transition>
  </div>
</template>


<script>
import { ref } from 'vue';

import blueprints from './blueprints';
import BlueprintSetup from './blueprints/BlueprintSetup.vue';

export default {
  components: { BlueprintSetup },

  emits: ['back'],

  setup(props, { emit }) {
    const selected = ref(null);

    return {
      blueprints,

      selected,

      back(close) {
        selected.value = null;

        if (close) {
          emit('back');
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
</style>
