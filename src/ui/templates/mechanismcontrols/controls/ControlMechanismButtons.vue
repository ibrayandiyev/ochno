<template>
  <div class="control-mechanism-buttons text-center">
    <div class="button-grid grid">
      <el-button v-for="(button, index) in buttons" :key="index" :class="{ ...button.class, 'is-current': $_.isMatch(currentState, button.payload) }" :style="button.style || ''" @click="() => click(button.payload)">
        {{ button.text }}
      </el-button>
    </div>

    <div class="mechanism-status grid">
      <div v-if="fetching" class="relative" style="height: 1rem; width: 1rem;">
        <Spinner class="inline" />
      </div>
      <div v-if="error" class="color-error">
        <Icon type="info" />
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>


<script>
import i18next from 'i18next';
import { ref } from 'vue';

import mechanismsStore from '../../../../modules/mechanisms/store';

export default {
  props: {
    mechanismIds: { type: Array },
    buttons: { type: Array },
  },

  setup(props) {
    const fetching = ref(0);
    const error = ref(null);
    const currentState = ref(null);

    const click = (payload) => {
      if (payload) {
        error.value = null;
        fetching.value = props.mechanismIds.length;

        props.mechanismIds.forEach(async (id) => {
          try {
            // TODO: This doesn't take into account multiple mechanisms.
            //       Could solve this by adding the mechanism state to the store and having a better "put" function taking multiple ids.
            const value = await mechanismsStore.dispatch.putState({ id, state: payload });
            currentState.value = value;
          } catch (err) {
            error.value = i18next.t('Unable to get automation status');
          }
          fetching.value -= 1;
        });
      }
    };

    click({});

    return {
      fetching,
      error,
      currentState,

      click,
    };
  },
};
</script>

<style scoped lang="less">
.button-grid {
  justify-content: center;
}

.horizontal-buttons .button-grid {
  grid-auto-flow: column;
}

.mechanism-status {
  grid-template-columns: auto auto;
  justify-content: center;
  height: 1.75rem;

  .spinner {
    opacity: 0;
    animation: fade-to-1 1s 1s forwards;
  }
}
</style>
