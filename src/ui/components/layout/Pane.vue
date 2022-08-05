<template>
  <div ref="el" class="pane bg-gray-1">
    <div class="header bg-gray-2 -common-height">
      <div class="bg-transparent -square -common-height">
        <slot name="icon" />
      </div>

      <h3>
        <slot name="title" />
      </h3>

      <div class="tools bg-gray-2">
        <slot name="tool" />

        <el-button class="-square -common-height -borderless" @click="close">
          <Icon type="delete" />
        </el-button>
      </div>
    </div>

    <div class="content">
      <slot v-if="!scrollbar" />
      <Scrollbar v-else>
        <slot />
      </Scrollbar>
    </div>
  </div>
</template>


<script>
import { ref, watchEffect, onUnmounted } from 'vue';

import idleEvent from '../../utils/idleEvent';

export default {
  props: {
    inactiveClose: { type: Number }, // In seconds
    scrollbar: { type: Boolean, default: true },
  },

  emits: ['close-pane'],

  setup(props, { emit }) {
    const el = ref(null);
    const destroyIdle = ref(null); // TODO: It would be nice to have this as a directive :)

    const close = () => emit('close-pane', el.value);

    const cancelIdle = () => {
      if (destroyIdle.value) {
        destroyIdle.value();
        destroyIdle.value = null;
      }
    };

    watchEffect(() => {
      if (props.inactiveClose) {
        cancelIdle();
        destroyIdle.value = idleEvent(props.inactiveClose * 1000, close);
      }
    });

    onUnmounted(cancelIdle);

    return {
      el,
      close,
    };
  },
};
</script>


<style scoped lang="less">
.header {
  position: relative;
  line-height: var(--common-size);
  text-transform: uppercase;
  white-space: nowrap;

  > .icon {
    margin-right: 1.5rem;
    margin-bottom: -0.25em;
  }

  h3 {
    display: inline-block;
  }
}

.tools {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: row;
}

.content {
  position: relative;
  height: ~'calc(100% - var(--common-size))';

  &.no-padding {
    padding: 0;
  }
}

@media (max-height: 768px) {
  .header {
    display: none;
  }

  .content {
    height: 100%;
  }
}

.pane-header-always {
  .header {
    display: block;

    ~ .content {
      // Necessary to counteract the rule of a pane when height gets below 768 px, since that would hide the header.
      height: ~'calc(100% - var(--common-size))';
    }
  }
}
</style>
