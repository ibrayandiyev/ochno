<template>
  <AdjustableGrid :vertical="true" @overrun="relay">
    <Pane v-if="show" min="250px" @close-pane="show = false">
      <template #icon>
        <Icon type="laptop" />
      </template>

      <template #title>
        <span>Device Types</span>
      </template>

      <template #tool>
        <el-tooltip v-if="canCreate" placement="top" content="Create new device type">
          <el-button class="-square -common-height -borderless" @click="toggleSelection('creating')">
            <Icon type="add" />
          </el-button>
        </el-tooltip>

        <el-button class="-square -common-height -borderless" @click="fetchAll()">
          <Icon type="refresh" :class="{ rotating: fetching }" />
        </el-button>
      </template>

      <div class="admin-content">
        <div class="admin-legend grid no-gap">
          <div>Id</div>
          <div>Vid</div>
          <div>Pid</div>
          <div>Voltage</div>
          <div>Manufacturer</div>
          <div>Product</div>
          <div>Types</div>
          <div>Subtypes</div>
          <div>Properties</div>
        </div>

        <AdminEmptyList :filtered="deviceTypes" :fetching="fetching" />

        <div v-for="device in deviceTypes" :key="device.id" class="admin-grid grid no-gap" @click="toggleSelection(device.id)">
          <div>{{ device.id }}</div>
          <div>{{ $_.get(device, 'match.vid') }}</div>
          <div>{{ $_.get(device, 'match.pid') }}</div>
          <div>{{ $_.get(device, 'match.voltage') }}</div>
          <div>{{ $_.get(device, 'resolve.device.manufacturer') }}</div>
          <div>{{ $_.get(device, 'resolve.device.product') }}</div>
          <div>{{ $_.castArray($_.get(device, 'resolve.device.types')).join(', ') }}</div>
          <div>{{ $_.castArray($_.get(device, 'resolve.device.subtypes')).join(', ') }}</div>
          <div>{{ Object.keys($_.get(device, 'resolve', {})).join(', ') }}</div>
        </div>

        <Spinner v-if="fetching" />
      </div>
    </Pane>

    <AdminDeviceType
      v-if="selected"
      :id="selected"
      min="250px"
      init="60%"
      @created="toggleSelection($event)"
      @close-pane="toggleSelection(null)"
    />
  </AdjustableGrid>
</template>


<script>
import AdminDeviceType from './AdminDeviceType.vue';
import useItems, { emits, components } from '../../../components/admin/useItems';
import useFetchers from '../../../composables/useFetchers';
import store from '../../../../modules/devicetypes/store';

export default {
  components: { ...components, AdminDeviceType },
  emits,

  setup(props, context) {
    return {
      ...useItems({ store }, context), // show, selected, relay, toggleSelection

      ...useFetchers([ // fetching, fetchAll
        { store },
      ]),

      deviceTypes: store.state.deviceTypes,
    };
  },
};
</script>

<style scoped lang="less">
.admin-legend,
.admin-grid {
  grid-template-columns: calc(var(--common-size) * 3) repeat(3, (var(--common-size))) repeat(5, 1fr);
}
</Style>
