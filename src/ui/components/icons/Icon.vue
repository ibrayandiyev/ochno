<template>
  <component :is="svg" class="icon" :class="classes" />
</template>


<script>
import _ from 'lodash';
import { computed } from 'vue';

import lookup from './lookup';
import portsStore from '../../../modules/ports/store';

export default {
  props: {
    type: { type: String },
    default: { type: String },
    prefix: { type: String },
    portId: { type: String },
  },

  setup(props) {
    const portInfo = computed(() => (props.portId && portsStore.state.info?.[props.portId]));

    const current = computed(() => {
      const type = portInfo.value?.icon || props.type;
      const icon = lookup[type] ? type : props.default;
      return props.prefix ? `device${_.upperFirst(icon)}` : icon;
    });

    return {
      svg: computed(() => lookup[current.value]),

      classes: computed(() => {
        const append = portInfo.value?.online === false ? ' offline' : '';
        return `icon-${current.value}${append}`;
      }),
    };
  },
};
</script>

<!-- NOT SCOPED! -->
<style lang="less">
.icon {
  display: inline-block;
  width: var(--icon-size);
  height: var(--icon-size);
  line-height: var(--icon-size);
  text-align: center;
  vertical-align: middle;
  fill: currentColor;

  // Device icons:
  #Icon {
    fill: var(--rgba-icon-fg);
  }
  #Shadow {
    fill: var(--rgba-icon-shadow);
  }
  #Background {
    fill: var(--rgba-icon-bg);
  }
}

// Special icon that creates an arrow using css.
.icon-arrow-down {
  position: relative;
  transition: transform 0.2s;

  &:before {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    top: 45%;
    width: 0.7em;
    height: 0.7em;
    border-bottom: 2px solid rgb(var(--color-font));
    border-right: 2px solid rgb(var(--color-font));
    border-color: inherit;
    transform: translate(-45%, -55%) rotateZ(45deg);
    transition: transform var(--transition-duration-open), border-color var(--transition-duration-input);
  }
}

// Special changes to icons
.icon-delete { // Delete icon is the same as add, just rotated.
  transform: rotateZ(45deg) scale(1.1);
}

.icon-deviceHub,
.icon-deviceEdge {
  #Shadow {
    fill: transparent;
  }

  #Background {
    fill: var(--rgba-icon-shadow);
  }

  // Change shape?
  // clip-path: ellipse(75% 40% at center);
}

// STATES
.offline {
  opacity: 0.5;
}
</style>
