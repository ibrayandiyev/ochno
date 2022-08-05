<template>
  <div
    ref="el"
    :class="`${type}-marker`"
    class="item-marker marker"
    @click="onClick"
    @mousedown="dragStart"
    @touchstart="dragStart"
  >
    <el-popover placement="top" :teleported="false">
      <template #reference>
        <Icon v-if="portInfo" prefix="device" :port-id="id" default="port" />
        <Icon v-else prefix="device" :type="type" default="ochnoOperated" />
      </template>

      <div class="auto-fr-grid">
        <template v-if="type === 'port'">
          <template v-if="!portInfo">
            <div class="column-span-2 text-center color-error">{{ $t('Item is no longer connected to this space') }}</div>
          </template>
          <template v-else>
            <div v-if="portInfo.online === false" class="column-span-2 text-center color-error">{{ $t('Connection lost') }}</div>
            <Icon :type="portInfo.icon" default="port" />
            <span>{{ portInfo.name }}</span>
          </template>
        </template>

        <template v-else-if="hub">
          <template v-if="hub.name">
            <Icon type="info" />
            <span>{{ hub.name }}</span>
          </template>
          <Icon type="hub" />
          <span>{{ hub.hwId }}</span>
        </template>

        <template v-else-if="edge">
          <template v-if="edge.name">
            <Icon type="info" />
            <span>{{ edge.name }}</span>
          </template>
          <Icon type="edge" />
          <span>Id: {{ edge.hwId }}</span>
        </template>

        <template v-else>
          <Icon :type="type" default="ochnoOperated" />
          <span class="font-capitalize">{{ type }}</span>
        </template>
      </div>
    </el-popover>
  </div>
</template>


<script>
import { ref, computed, watchEffect } from 'vue';

import edgesStore from '../../../../../modules/edges/store';
import hubsStore from '../../../../../modules/hubs/store';
import portsStore from '../../../../../modules/ports/store';

export default {
  props: {
    id: { type: String, required: true },
    type: { type: String },
    point: { type: Array, default: () => [0, 0] },
    editable: { type: Boolean, default: false },
  },

  emits: ['drag-start', 'drag-move', 'drag-end', 'click'],

  setup(props, { emit }) {
    const el = ref(null);

    watchEffect(() => {
      if (el.value) {
        el.value.point = props.point; // NOTE: Using reference to reactive prop
      }
    });

    function move(x, y) {
      emit('drag-move', { x, y, el: el.value, itemId: props.id });
    }

    function mouseMove(event) {
      move(event.offsetX, event.offsetY);
    }

    function touchMove(event) {
      const lastTouch = event.targetTouches.item(event.targetTouches.length - 1);
      move(lastTouch.clientX, lastTouch.clientY);
    }

    function end() {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);

      emit('drag-end', { itemId: props.id, point: props.point });
    }

    const dragStart = (event) => {
      if (props.editable && el.value) {
        if (event.type === 'touchstart') {
          window.addEventListener('touchmove', touchMove);
          window.addEventListener('touchend', end);
          window.addEventListener('touchcancel', end);
        } else {
          window.addEventListener('mousemove', mouseMove);
          window.addEventListener('mouseup', end);
        }

        emit('drag-start', { itemId: props.id });
      }
    };

    const onClick = (event) => emit('click', Object.assign(event, { itemId: props.id }));

    return {
      emit,

      el,

      portInfo: computed(() => portsStore.state.info[props.id]),
      edge: computed(() => edgesStore.state.edges[props.id]),
      hub: computed(() => hubsStore.state.hubs[props.id]),

      dragStart,
      onClick,
    };
  },
};
</script>


<style scoped lang="less">
</style>
