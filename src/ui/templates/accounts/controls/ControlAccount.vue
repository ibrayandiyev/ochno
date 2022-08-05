<template>
  <div class="control-width">
    <div class="header-info grid p-block">
      <h3>{{ $t('Account') }}</h3>
    </div>

    <div class="control-grid p-down m-down">
      <div class="-circle"><Icon type="edit" /></div>
      <div class="label">{{ $t('Name') }}</div>
      <Field v-model="accountName" />
    </div>

    <h4 class="text-center m-down">{{ $t('Access groups') }}</h4>

    <el-collapse v-model="expanded" class="m-down">
      <el-collapse-item v-for="{ id, name } in account.groups" :key="id" :name="id">
        <template #title>
          <div class="grid">
            <h3>{{ name }}</h3>
          </div>
        </template>

        <ControlAccountGroup v-if="expanded.includes(id)" :account-id="accountId" :group-id="id" />
      </el-collapse-item>
    </el-collapse>

    <transition name="fade">
      <div v-if="!expanded.length" class="text-center opacity-hvy">
        <el-button @click="showAdd = true">
          <Icon type="add" class="m-end" />
          {{ $t('Add') }}
        </el-button>
      </div>
    </transition>

    <el-dialog v-model="showAdd" :modal="false">
      <template #header>
        <h1>{{ $t('Add access group') }}</h1>
        <el-button class="-square -common-height -borderless" @click="showAdd = false">
          <Icon type="delete" />
        </el-button>
      </template>

      <div class="grid" style="grid-template-columns: auto auto; justify-content: center;">
        <div>{{ $t('Name') }}</div>
        <Field v-model="addName" @keyup.enter="addGroup" />
      </div>

      <template #footer>
        <div>
          <el-button :disabled="adding" class="-borderless" @click="showAdd = false">
            {{ $t('Cancel') }}
          </el-button>
          <el-button :disabled="!addName || adding" @click="addGroup">
            {{ $t('Add access group') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>


<script>
import _ from 'lodash';
import { ref, computed, watchEffect } from 'vue';

import ControlAccountGroup from './ControlAccountGroup.vue';
import useSave from '../../../composables/useSave';
import { showError } from '../../../utils/error';
import accountsStore from '../../../../modules/accounts/store';

export default {
  components: { ControlAccountGroup },

  props: {
    accountId: { type: String, required: true },
  },

  setup(props) {
    const expanded = ref([]);
    const showAdd = ref(false);
    const addName = ref('');
    const adding = ref(false);

    const account = computed(() => accountsStore.state.accounts[props.accountId]);
    const saveAccount = useSave({ actual: account, store: accountsStore });

    watchEffect(() => {
      // If an account group is removed, remove it from expanded values too.
      const ids = account.value?.groups?.map(({ id }) => id) || [];
      expanded.value = _.intersection(expanded.value, ids);
    });

    return {
      expanded,
      showAdd,
      addName,
      adding,

      account,
      title: accountsStore.getters.title,

      accountName: computed({
        get: () => account.value?.name,
        set: (value) => {
          if (saveAccount.item) {
            saveAccount.item.name = value;
            saveAccount.saveItem();
          }
        },
      }),

      async addGroup() {
        adding.value = true;
        try {
          const newGroup = await accountsStore.dispatch.groups.post({
            id: props.accountId,
            groupId: props.groupId,
            data: {
              name: addName.value,
            },
          });
          // Adding the new group to the store account values, since it doesn't do so automatically.
          account.value.groups.push(newGroup);
          showAdd.value = false;
          expanded.value.push(newGroup.id);
        } catch (error) {
          showError(error);
        }
        adding.value = false;
      },
    };
  },
};
</script>


<style scoped lang="less">
</style>
