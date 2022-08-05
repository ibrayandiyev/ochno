<template>
  <div>
    <div v-if="!authorisation">
      No group.
    </div>

    <template v-else>
      <div class="m-down">
        <h3 class="m-down-col">Users</h3>
        <div v-for="userId in authorisation.userIds" :key="userId">
          {{ userId }}
        </div>
      </div>

      <div>
        <h3 class="m-down-col">Access</h3>
        <div class="access-grid grid">
          <template v-for="({ action, subject }, index) in authorisation.abilities" :key="index">
            <Field type="select" :multiple="true" :model-value="$_.castArray(action)">
              <template #options>
                <el-option v-for="act in ACTIONS" :key="act" :label="act" :value="act" />
              </template>
            </Field>
            <Field type="select" :model-value="subject">
              <template #options>
                <el-option v-for="sub in SUBJECTS" :key="sub" :label="sub" :value="sub" />
              </template>
            </Field>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>


<script>
import { ACTIONS, SUBJECTS } from '../../../../modules/auth/abilities';

export default {
  props: {
    accountId: { type: String },
    groupId: { type: String },
    authorisation: { type: Object },
  },

  setup() {
    return {
      ACTIONS,
      SUBJECTS,
    };
  },
};
</script>


<style>
.access-grid {
  grid-template-columns: auto auto;
}
</style>
