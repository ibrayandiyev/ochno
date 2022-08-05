<template>
  <el-dialog v-model="showing" :modal="false" :close-on-click-modal="false">
    <template #header>
      <h1>{{ $t('Create space') }}</h1>
      <el-button class="-square -common-height -borderless" @click="showing = false">
        <Icon type="delete" />
      </el-button>
    </template>

    <div class="grid" style="grid-template-columns: auto auto; justify-content: center;">
      <div>{{ $t('Account') }}</div>
      <Field v-model="item.accountId" type="select" :message="errors.accountId" @keyup.enter="focusNext">
        <template #options>
          <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
        </template>
      </Field>

      <div>{{ $t('Name') }}</div>
      <Field v-model="item.name" :message="errors.name" @keyup.enter="addSpace" />
    </div>

    <template #footer>
      <div>
        <el-button :disabled="saving" class="-borderless" @click="showing = false">
          {{ $t('Cancel') }}
        </el-button>
        <el-button :disabled="!item.accountId || !item.name || saving" @click="addSpace">
          {{ $t('Create space') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


<script>
import { computed, toRaw } from 'vue';

import useSave from '../../composables/useSave';
import focusNext from '../../utils/focusNext';
import { showError } from '../../utils/error';
import accountsStore from '../../../modules/accounts/store';
import spacesStore from '../../../modules/spaces/store';

export default {
  props: {
    show: { type: Boolean, default: false },
  },

  emits: ['update:show', 'created'],

  setup(props, { emit }) {
    const save = useSave({ actual: {}, store: spacesStore });

    return {
      ...save,

      spaces: spacesStore.state.spaces,
      saving: spacesStore.state.saving,

      accounts: accountsStore.state.accounts,

      showing: computed({
        get: () => props.show,
        set: (value) => emit('update:show', value),
      }),

      focusNext,

      async addSpace() {
        try {
          const space = await save.saveItem(toRaw(save.item));
          if (space) {
            emit('created', space);
          }
        } catch (error) {
          showError(error);
        }
      },
    };
  },
};
</script>


<style scoped lang="less">

</style>
