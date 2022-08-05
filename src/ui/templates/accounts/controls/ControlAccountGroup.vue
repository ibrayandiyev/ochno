<template>
  <div class="info-wrapper m-block">
    <Spinner v-if="fetching" />

    <div class="control-grid m-block">
      <div class="-circle"><Icon type="edit" /></div>
      <div class="label">{{ $t('Name') }}</div>
      <Field v-model="item.name" />
    </div>

    <div class="m-down">
      <h4 class="m-down-col">Users</h4>

      <div>
        <el-button v-for="{ email } in users" :key="email" class="-quadratic">
          {{ email }}
        </el-button>
      </div>
    </div>

    <div>
      <h4 class="m-down-col">Permissions</h4>

      <div class="control-grid m-block">
        <div class="-circle"><Icon type="home" /></div>
        <div class="label">{{ $t('Account') }}</div>
        <Field type="select" :model-value="permission(SUBJECTS.Accounts)" @input:model-value="updatePermission(SUBJECTS.Accounts, $event)">
          <template #options>
            <el-option v-for="{ key, label } in $_.omit(actions, actions.write.key)" :key="key" :label="label" :value="key" />
          </template>
        </Field>

        <div class="-circle"><Icon type="map" /></div>
        <div class="label">{{ $t('Spaces') }}</div>
        <Field type="select" :model-value="permission(SUBJECTS.Spaces)" @input:model-value="updatePermissions([SUBJECTS.Spaces, SUBJECTS.ControlSchemes], $event)">
          <template #options>
            <el-option v-for="{ key, label } in actions" :key="key" :label="label" :value="key" />
          </template>
        </Field>

        <div class="-circle"><Icon type="hub" /></div>
        <div class="label">{{ $t('Hubs') }}</div>
        <Field type="select" :model-value="permission(SUBJECTS.Hubs)" @input:model-value="updatePermission(SUBJECTS.Hubs, $event)">
          <template #options>
            <el-option v-for="{ key, label } in actions" :key="key" :label="label" :value="key" />
          </template>
        </Field>
      </div>

      <div class="actions-grid grid p-block-s">
        <div /><!-- To make the save buttons centered -->

        <el-button :disabled="!isChanged || saving" @click="save">{{ $t('Save changes') }}</el-button>

        <el-tooltip placement="top" :content="$t('Revert changes')">
          <el-button :disabled="!isChanged" class="-square -borderless" @click="revert"><Icon type="undo" /></el-button>
        </el-tooltip>

        <el-tooltip placement="top" :content="$t('Delete access group')">
          <el-button class="-square -borderless" @click="remove"><Icon type="bin" /></el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>


<script>
import i18next from 'i18next';
import _ from 'lodash';
import { ref, computed, watch } from 'vue';

import useFetchers from '../../../composables/useFetchers';
import useSave from '../../../composables/useSave';
import { showError } from '../../../utils/error';
import { ACTIONS, SUBJECTS } from '../../../../modules/auth/abilities';
import accountsStore from '../../../../modules/accounts/store';
import usersStore from '../../../../modules/users/store';

const actions = {
  admin: { key: 'admin', label: i18next.t('Administer') },
  write: { key: 'write', label: i18next.t('Update') },
  read: { key: 'read', label: i18next.t('Read') },
  none: { key: 'none', label: i18next.t('None') },
};

export default {
  props: {
    accountId: { type: String, required: true },
    groupId: { type: String, required: true },
  },

  setup(props) {
    const group = ref();
    const saving = ref(false);

    const fetchUsers = computed(() => {
      const ids = _.without(group.value?.userIds, ...usersStore.state.ids);
      return ids.length ? ids : undefined;
    });

    const { fetching } = useFetchers([
      { store: usersStore, params: () => ({ id: fetchUsers.value }), trigger: fetchUsers },
    ]);

    const account = computed(() => accountsStore.state.accounts[props.accountId]);
    const saveGroup = useSave({ actual: group, store: accountsStore });

    watch(
      () => props.groupId,
      async (newValue) => {
        group.value = await accountsStore.dispatch.groups.getOne({ id: props.accountId, groupId: newValue });
        // Setting name here to make it easier for us to use it as a change state.
        group.value.name = account.value?.groups?.find(({ id }) => id === newValue)?.name;
      },
      { immediate: true },
    );

    function updatePermission(key, value) {
      const abilities = saveGroup.item?.abilities?.filter(({ subject }) => subject === key);
      if (abilities) {
        if (!abilities.length) {
          const ability = { action: [], subject: key, conditions: { accountId: props.accountId } };
          saveGroup.item.abilities.push(ability);
          abilities.push(ability);
        }

        abilities.forEach((ability) => {
          /* eslint-disable no-param-reassign */
          if (value === actions.admin.key) {
            ability.action = ACTIONS.manage;
          } else if (value === actions.write.key) {
            ability.action = [ACTIONS.read, ACTIONS.update];
          } else if (value === actions.read.key) {
            ability.action = ACTIONS.read;
          } else {
            ability.action = [];
          }
          /* eslint-enable no-param-reassign */
        });
      }
    }

    return {
      SUBJECTS,
      actions,

      saving,
      fetching,
      item: saveGroup.item,
      isChanged: saveGroup.isChanged,
      revert: saveGroup.revert,

      users: computed(() => saveGroup.item?.userIds?.map((id) => usersStore.state.users[id])),

      permission: computed(() => (key) => {
        const abilities = saveGroup.item?.abilities?.filter(({ subject }) => subject === key);
        if (abilities) {
          if (abilities.find(({ action }) => _.castArray(action).includes(ACTIONS.manage))) {
            return actions.admin.key;
          }
          if (abilities.find(({ action }) => _.castArray(action).includes(ACTIONS.update))) {
            return actions.write.key;
          }
          if (abilities.find(({ action }) => _.castArray(action).includes(ACTIONS.read))) {
            return actions.read.key;
          }
        }
        return actions.none.key;
      }),

      updatePermission,

      updatePermissions(keys, value) {
        keys.forEach((key) => updatePermission(key, value));
      },

      async save() {
        saving.value = true;
        try {
          group.value = await accountsStore.dispatch.groups.put({
            id: props.accountId,
            groupId: props.groupId,
            data: {
              name: saveGroup.item.name,
              userIds: saveGroup.item.userIds,
              abilities: saveGroup.item.abilities,
            },
          });
          // Setting name here to make it easier for us to use it as a change state.
          group.value.name = account.value?.groups?.find(({ id }) => id === props.groupId)?.name;
        } catch (error) {
          showError(error);
        }
        saving.value = false;
      },

      async remove() {
        try {
          await saveGroup.confirmation();
        } catch (error) {
          // Using an catch function to capture 'cancel' message.
        }
        try {
          await accountsStore.dispatch.groups.delete({ id: props.accountId, groupId: props.groupId });
          // Removing the group from the store account values, since it doesn't do so automatically.
          _.remove(account.value.groups, { id: props.groupId });
        } catch (error) {
          showError(error);
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.info-wrapper {
  padding-inline: 5%;
}

.actions-grid {
  grid-template-columns: minmax(0, calc((var(--field-size) * 2) + 1rem)) 1fr auto auto;
  justify-items: center;
  margin: calc(var(--row-gap) * 1.5) auto;
}
</style>
