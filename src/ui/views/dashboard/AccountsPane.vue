<template>
  <Pane class="bg-gray-2" v-responsive="{ 'no-control-number': el => el.width <= 350, 'no-control-label': el => el.width <= 300 }" @close-pane="emit('close-pane', $event)">
    <template #icon>
      <Icon type="home" />
    </template>
    <template #title>
      <span>{{ $t('Account') }}</span>
    </template>

    <ControlAccounts />
  </Pane>
</template>


<script>
import Pane from '../../components/layout/Pane.vue';
import ControlAccounts from '../../templates/accounts/controls/ControlAccounts.vue';

export default {
  components: { ControlAccounts, Pane },

  emits: ['close-pane'],

  setup(props, { emit }) {
    return {
      emit,
    };
  },
};
</script>


<style scoped lang="less">

</style>
