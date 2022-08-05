<template>
  <Workspace v-page-title="'Admin'" class="admin pane-header-always background-logo text-selectable" @overrun="overrun">
    <!-- Pane switches -->
    <template #function>
      <el-checkbox :model-value="panes.users.open" class="-square -common-height bg-transparent" @input="togglePane(panes.users)">
        <Icon type="users" />
        <div class="function-text">Users</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.accounts.open" class="-square -common-height bg-transparent" @input="togglePane(panes.accounts)">
        <Icon type="home" />
        <div class="function-text">Accounts</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.spaces.open" class="-square -common-height bg-transparent" @input="togglePane(panes.spaces)">
        <Icon type="map" />
        <div class="function-text">Spaces</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.edges.open" class="-square -common-height bg-transparent" @input="togglePane(panes.edges)">
        <Icon type="mission" />
        <div class="function-text">Edges</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.hubs.open" class="-square -common-height bg-transparent" @input="togglePane(panes.hubs)">
        <Icon type="hub" />
        <div class="function-text">Hubs</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.ports.open" class="-square -common-height bg-transparent" @input="togglePane(panes.ports)">
        <Icon type="port" />
        <div class="function-text">Ports</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.mechanisms.open" class="-square -common-height bg-transparent" @input="togglePane(panes.mechanisms)">
        <Icon type="toolbox" />
        <div class="function-text">Mechanisms</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.mechanismControls.open" class="-square -common-height bg-transparent" @input="togglePane(panes.mechanismControls)">
        <Icon type="controls" />
        <div class="function-text">Controls</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.controlSchemes.open" class="-square -common-height bg-transparent" @input="togglePane(panes.controlSchemes)">
        <Icon type="controls" />
        <div class="function-text">Schemes</div>
      </el-checkbox>

      <el-checkbox :model-value="panes.deviceTypes.open" class="-square -common-height bg-transparent" @input="togglePane(panes.deviceTypes)">
        <Icon type="laptop" />
        <div class="function-text">Devices</div>
      </el-checkbox>
    </template>

    <!-- Panes -->
    <template #panes>
      <AdminUsers
        v-if="panes.users.open || panes.users.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.users.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.users)"
      />

      <AdminAccounts
        v-if="panes.accounts.open || panes.accounts.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.accounts.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.accounts)"
      />

      <AdminSpaces
        v-if="panes.spaces.open || panes.spaces.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.spaces.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.spaces)"
      />

      <AdminEdges
        v-if="panes.edges.open || panes.edges.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.edges.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.edges)"
      />

      <AdminHubs
        v-if="panes.hubs.open || panes.hubs.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.hubs.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.hubs)"
      />

      <AdminPorts
        v-if="panes.ports.open || panes.ports.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.ports.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.ports)"
      />

      <AdminMechanisms
        v-if="panes.mechanisms.open || panes.mechanisms.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.mechanisms.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.mechanisms)"
      />

      <AdminMechanismControls
        v-if="panes.mechanismControls.open || panes.mechanismControls.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.mechanismControls.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.mechanismControls)"
      />

      <AdminControlSchemes
        v-if="panes.controlSchemes.open || panes.controlSchemes.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.controlSchemes.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.controlSchemes)"
      />

      <AdminDeviceTypes
        v-if="panes.deviceTypes.open || panes.deviceTypes.hidden"
        init="50%"
        min="300px"
        :style="{ display: panes.deviceTypes.hidden ? 'none' : '' }"
        @close-pane="closePane(panes.deviceTypes)"
      />
    </template>
  </Workspace>
</template>


<script>
import _ from 'lodash';
import { reactive, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import useWorkspace from '../../components/layout/useWorkspace';
import Workspace from '../../components/layout/Workspace.vue';
import AdminAccounts from '../../templates/accounts/admin/AdminAccounts.vue';
import AdminControlSchemes from '../../templates/controlschemes/admin/AdminControlSchemes.vue';
import AdminDeviceTypes from '../../templates/devicetypes/admin/AdminDeviceTypes.vue';
import AdminEdges from '../../templates/edges/admin/AdminEdges.vue';
import AdminHubs from '../../templates/hubs/admin/AdminHubs.vue';
import AdminMechanismControls from '../../templates/mechanismcontrols/admin/AdminMechanismControls.vue';
import AdminMechanisms from '../../templates/mechanisms/admin/AdminMechanisms.vue';
import AdminPorts from '../../templates/ports/admin/AdminPorts.vue';
import AdminSpaces from '../../templates/spaces/admin/AdminSpaces.vue';
import AdminUsers from '../../templates/users/admin/AdminUsers.vue';

export default {
  components: { AdminAccounts, AdminControlSchemes, AdminDeviceTypes, AdminEdges, AdminHubs, AdminMechanismControls, AdminMechanisms, AdminPorts, AdminSpaces, AdminUsers, Workspace },

  setup() {
    const router = useRouter();
    const route = useRoute();

    const panes = reactive({
      users: { open: false, hidden: false, time: 0 },
      accounts: { open: false, hidden: false, time: 0 },
      spaces: { open: false, hidden: false, time: 0 },
      edges: { open: false, hidden: false, time: 0 },
      hubs: { open: false, hidden: false, time: 0 },
      ports: { open: false, hidden: false, time: 0 },
      mechanisms: { open: false, hidden: false, time: 0 },
      mechanismControls: { open: false, hidden: false, time: 0 },
      controlSchemes: { open: false, hidden: false, time: 0 },
      deviceTypes: { open: false, hidden: false, time: 0 },
    });

    watchEffect(() => {
      const openPanes = Object.keys(panes).filter((key) => panes[key].open);
      if (_.xor(openPanes, _.castArray(route.query.pane)).length !== 0) {
        router.replace({ query: { pane: openPanes } })
          .catch(() => {}); // Catch is necessary to avoid error messages.
      }
    });

    return {
      ...useWorkspace({ panes }), // space, openPane, closePane, togglePane, overrun

      panes,
    };
  },
};
</script>

<style scoped lang="less">
.admin:deep(.functions-wrapper) .functions {
  max-width: none;
  margin: 0 var(--common-size);
}

.admin:deep(.panes) {
  .admin-legend,
  .admin-grid {
    margin-top: 0;
  }

  .admin-legend {
    font-size: 0.8em;
    height: 2rem;
    color: fade(white, 70%);
  }

  .admin-grid {
    min-height: calc(var(--common-size) / 2);
    background: fade(white, 20%);
    cursor: pointer;

    &:nth-child(2n) {
      background: fade(white, 10%);
    }

    &:hover {
      background: fade(white, 30%);
    }
  }

  .admin-bg {
    max-width: 100%;
    max-height: calc(var(--common-size) / 2);
    justify-self: center;
  }

  .admin-single-grid {
    grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
    align-items: initial;
    padding: 0 var(--row-gap) var(--row-gap);
    min-height: calc(var(--common-size) / 2);
    background: none !important;
    cursor: auto;
  }

  .admin-header {
    line-height: 4em;
    text-align: center;
  }
}
</Style>
