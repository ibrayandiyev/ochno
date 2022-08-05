<template>
  <div ref="el" :class="orientation" class="pane-resizer bg-black" @mousedown="mouseDown" @touchstart="touchStart" />
</template>


<script>
import { ref, onUnmounted } from 'vue';

export default {
  props: {
    handle: { type: Number, required: true },
    vertical: { type: Boolean },
  },

  emits: ['resize-start', 'resize', 'resize-end'],

  setup(props, { emit }) {
    const el = ref(null);

    function start() {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = props.vertical ? 'row-resize' : 'col-resize';
      emit('resize-start', { handle: props.handle });
    }

    function move(x, y) {
      const elPos = el.value.getBoundingClientRect();
      const change = props.vertical
        ? y - ((elPos.top + elPos.bottom) / 2)
        : x - ((elPos.left + elPos.right) / 2);

      if (change) {
        emit('resize', { handle: props.handle, change });
      }
    }

    function end(e) {
      e.preventDefault();
      cleanup(); // eslint-disable-line no-use-before-define
      emit('resize-end', { handle: props.handle });
    }

    function mouseMove(e) {
      e.preventDefault();
      move(e.clientX, e.clientY);
    }

    function mouseDown(e) {
      e.preventDefault();
      // Have to attach to window here, if the user goes outside the window this picks up all events.
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', end);
      start();
    }

    function touchMove(e) {
      const lastTouch = e.targetTouches.item(e.targetTouches.length - 1);
      move(lastTouch.clientX, lastTouch.clientY);
    }

    function touchStart(e) {
      e.preventDefault();
      // Have to attach to window here, if the user goes outside the window this picks up all events.
      window.addEventListener('touchmove', touchMove);
      window.addEventListener('touchend', end);
      window.addEventListener('touchcancel', end);
      start();
    }

    function cleanup() {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);
    }

    onUnmounted(cleanup);

    return {
      el,
      orientation: props.vertical ? 'vertical' : 'horizontal',
      mouseDown,
      touchStart,
    };
  },
};
</script>


<style scoped lang="less">
@handle-width: 1px;
@handle-height: 20px;
@resizer-width: 3px;

.pane-resizer {
  position: relative;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;

  &:before,
  &:after {
    content: '';
  }

  &:before {
    position: absolute;
    z-index: 1;
  }

  &:after {
    background-color: rgb(var(--color-gray-3));
    border-radius: @handle-width;
  }
}

.horizontal { // Resizer is vertical (drags left-right).
  width: @resizer-width;
  height: 100%;
  cursor: col-resize;

  &:before {
    left: -@resizer-width;
    right: -@resizer-width;
    top: 0;
    bottom: 0;
  }

  &:after {
    width: @handle-width;
    height: @handle-height;
  }
}

.vertical {
  width: 100%;
  height: @resizer-width;
  cursor: row-resize;

  &:before {
    left: 0;
    right: 0;
    top: -@resizer-width;
    bottom: -@resizer-width;
  }

  &:after {
    width: @handle-height;
    height: @handle-width;
  }
}
</style>
