<template>
  <div class="workspace flex flex-column fill-view-height" :class="classes">
    <slot name="menu" class="menu">
      <SideMenu />
    </slot>

    <div class="header -common-height">
      <div class="functions flex-space-around">
        <slot name="function" />
      </div>
    </div>

    <div class="content relative">
      <slot />

      <div class="panes absolute-cover">
        <AdjustableGrid @overrun="$emit('overrun', $event)">
          <slot name="panes" />
        </AdjustableGrid>
      </div>
    </div>
  </div>
</template>


<script>
import { computed } from 'vue';

import SideMenu from './SideMenu.vue';
import AdjustableGrid from './AdjustableGrid.vue';

export default {
  components: { AdjustableGrid, SideMenu },

  emits: ['overrun'],

  setup(props, { slots }) {
    return {
      classes: computed(() => ({ 'has-functions': slots?.function().length })),
    };
  },
};
</script>


<style scoped lang="less">
@menu-media-break: 1024px;

.workspace {
  grid-template-rows: 0 var(--common-size) 1fr;
  position: relative;
  overflow: hidden;
  background-color: rgb(var(--color-black)); // Do not use bg-black class since-it sets row-line-color
}

.header {
  width: 100%;
  color: rgb(var(--color-gray-5));
}

.functions {
  max-width: @menu-media-break * 0.75;
  height: inherit;
  margin: auto;
}

.functions:deep(.el-checkbox) {
  .function-text {
    text-transform: uppercase;
    margin-top: 0.75em;
  }

  &.is-checked .icon {
    color: rgb(var(--color-primary));
  }
}

.content {
  // NOTE: It doesn't work well to put 100% height or flex-grow on content. For some reason it overflows into the other element.
  height: calc((var(--vh, 1vh) * 100) - var(--common-size));
}

.panes {
  pointer-events: none;

  .empty {
    color: rgb(var(--color-gray-4a));
    padding-bottom: 5rem;

    h1,
    h2,
    h3 {
      color: inherit;
    }

    .icon,
    h1 {
      margin-bottom: 2rem;
    }

    h2 {
      margin-bottom: 1rem;
    }
  }
}

.panes:deep(.pane),
.panes:deep(.pane-resizer) {
  pointer-events: auto;
}


// RESPONSIVE STATES
@media (max-width: @menu-media-break) {
  .has-functions {
    .header {
      order: 2;
    }

    .functions:deep(.el-checkbox) {
      .function-text {
        display: none;
      }
    }
  }
}

// @media (min-width: @menu-media-break + 1) {
// }
</style>
