<template>
  <div class="circular-slider" :class="{ disabled, moving }" :style="containerStyle">
    <svg
      ref="elSvg"
      :width="size + 'px'"
      :height="size + 'px'"
      :viewBox="'0 0 ' + size + ' ' + size"
      @click="click"
      @mousedown="mouseDown"
      @touchstart="touchStart"
    >
      <g>
        <path class="track" :d="path" :style="circleStyle()" />
        <path class="arc" :d="path" :style="circleStyle(angle / maxAngle)" />
        <circle class="knob" :cx="knobX" :cy="knobY" :r="knobRadius" :stroke-width="knobWidth" />
      </g>
    </svg>
    <div class="value"><slot :value="current">{{ current }}</slot></div>
  </div>
</template>


<script>
import _ from 'lodash';
import { ref, computed, watchEffect, onUnmounted } from 'vue';

const pi2 = Math.PI * 2;

function calcCircleAngle(angle) {
  return angle < 0 ? pi2 + angle : angle;
}

function partitionAngle(partitions, maxAngle) {
  if (partitions) {
    if (partitions > 1) {
      return maxAngle / (partitions - 1);
    }
    return maxAngle;
  }
  return 1;
}

// Much inspired by: https://github.com/devstark-com/vue-circle-slider
export default {
  props: {
    min: { type: Number, default: 0 }, // The minimum value the slider has.
    max: { type: Number, default: 100 }, // The maximum value the slider has.
    start: { type: Number, default: 0 }, // Value to start at.
    values: { type: Array, default: null }, // Supply an array of possible values, the slider will be partitioned according to their amount.

    size: { type: Number, default: 100 }, // Size of the entire component.
    width: { type: Number, default: 3 }, // Width of the circle.
    knobWidth: { type: Number, default: 3 }, // Width of the knob.

    gap: { type: Number, default: 0 }, // Between 0 and 1, where 0 is no gap and 1 is the entire circle.
    rotation: { type: Number, default: -90 }, // In degrees.

    wrap: { type: Boolean, default: false }, // If the slider should wrap immediately when making a full "lap".
    disabled: { type: Boolean, default: false }, // If the slider is disabled or not.
    changeThrottle: { type: Number, default: 200 }, // How often change method fires, in ms.
  },

  emits: ['change', 'diff'],

  setup(props, { emit }) {
    const elSvg = ref(null);
    const moving = ref(false); // When the user drags the knob.

    const angle = ref(0);

    const span = computed(() => props.max - props.min);
    const inverseGap = computed(() => 1 - props.gap);
    const maxAngle = computed(() => pi2 * inverseGap.value);
    const beforeHalf = computed(() => maxAngle.value * 0.4);
    const afterHalf = computed(() => maxAngle.value * 0.6);
    const angleValue = computed(() => span.value / maxAngle.value);
    const anglePerValue = computed(() => partitionAngle(props.values?.length, maxAngle.value));

    const current = computed(() => {
      if (props.values) {
        const count = Math.floor(angle.value / anglePerValue.value);
        return props.values[count];
      }
      return Math.round(props.min + (angle.value * angleValue.value));
    });

    const center = computed(() => props.size / 2);
    const radius = computed(() => center.value - props.width - props.knobWidth);
    const diameter = computed(() => radius.value * 2);
    const circumference = computed(() => radius.value * pi2);
    const path = computed(() => `M${center.value} ${center.value - radius.value}
      a ${radius.value} ${radius.value} 0 0 1 0 ${diameter.value}
      a ${radius.value} ${radius.value} 0 0 1 0 ${-diameter.value}`);
    const rotationInRadian = computed(() => (props.rotation / 180) * Math.PI);

    const knobX = computed(() => center.value + (radius.value * Math.cos(angle.value + rotationInRadian.value)));
    const knobY = computed(() => center.value + (radius.value * Math.sin(angle.value + rotationInRadian.value)));
    const knobRadius = computed(() => (props.width + props.knobWidth) / 2);

    // Calculate so that backgrounds end up in their correct places, if using for example the color wheel.
    const containerStyle = computed(() => ({
      backgroundPosition: `50% ${props.knobWidth + (props.width / 2)}px`,
      backgroundSize: `${props.size - (props.knobWidth * 2) - props.width}px`,
    }));

    let prevValue = 0;
    // Call this when the value of the slider changes. It's throttled to not send out a load of events.
    const throttleEmit = _.throttle(() => {
      emit('change', current.value);

      if (moving.value) {
        let diff = current.value - prevValue;
        if (props.wrap) {
          const startPart = span.value * 0.3;
          const endPart = span.value * 0.7;
          if (prevValue < startPart && current.value > endPart) { // Circling from start to end.
            diff = (prevValue - props.min) + (props.max - current.value);
          } else if (current.value < startPart && prevValue > endPart) { // Circling from end to start.
            diff = (current.value - props.min) + (props.max - prevValue);
          }
        }
        emit('diff', diff);
      }

      prevValue = current.value;
    }, props.changeThrottle);


    const angleFromValueArray = (index) => {
      // NOTE: Not possible to use computed properties in this function, since it us used at the data step.
      const clampedIndex = _.clamp(index, 0, props.values.length - 1);
      return clampedIndex * partitionAngle(props.values.length, pi2 * (1 - props.gap));
    };

    const angleFromValue = (value) => {
      // NOTE: Not possible to use computed properties in this function, since it us used at the data step.
      if (props.values) {
        return angleFromValueArray(props.values.indexOf(value));
      }

      return ((value - props.min) / (props.max - props.min)) * pi2 * (1 - props.gap);
    };

    // Calculate a normalized angle on the circle, including circle rotation and gap.
    const normalizeAngle = (x, y) => {
      if (elSvg.value) {
        const svg = elSvg.value.getBoundingClientRect(); // eslint-disable-line no-underscore-dangle
        const relX = x - svg.left;
        const relY = y - svg.top;
        const circleAngle = calcCircleAngle(Math.atan2(relY - center.value, relX - center.value) - rotationInRadian.value);

        // Check if we are beyond max angle. If so take gap into account, ergo calculate if value is closest to 0 or max.
        if (circleAngle > maxAngle.value) {
          return (circleAngle - maxAngle.value < pi2 - circleAngle) ? maxAngle.value : 0;
        }

        return circleAngle;
      }
      return 0;
    };

    const circleStyle = (percent = 1) => ({
      strokeWidth: props.width,
      strokeDasharray: `${(percent * inverseGap.value * circumference.value) + props.width} ${circumference.value}`,
      transform: `rotateZ(${props.rotation + 90}deg)`,
    });

    const update = (newAngle, wrap) => {
      let angleVal = newAngle;

      if (props.wrap || wrap || (newAngle > beforeHalf.value && newAngle < afterHalf.value)) {
        angleVal = newAngle;
      } else if (newAngle > afterHalf.value && angle.value <= beforeHalf.value) { // Circling from start to end.
        angleVal = 0;
      } else if (angle.value > afterHalf.value && newAngle <= beforeHalf.value) { // Circling from end to start.
        angleVal = maxAngle.value;
      }

      if (props.values) {
        angleVal = angleFromValueArray(Math.round(angleVal / anglePerValue.value));
      }

      if (angleVal !== angle.value) {
        angle.value = angleVal;
        throttleEmit();
      }
    };

    const click = (e) => {
      update(normalizeAngle(e.clientX, e.clientY), true);
    };

    const move = (x, y, wrap) => {
      const newAngle = normalizeAngle(x, y);
      if (angle.value !== newAngle) {
        moving.value = true;
        update(newAngle, wrap);
      }
    };

    const end = (e) => {
      e.preventDefault();
      cleanup(); // eslint-disable-line no-use-before-define
      moving.value = false;
    };

    const mouseMove = (e) => {
      e.preventDefault();
      move(e.clientX, e.clientY);
    };

    const mouseDown = (e) => {
      e.preventDefault();
      // Have to attach to window, if the user goes outside the window this picks up all events.
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', end);
      move(e.clientX, e.clientY, true); // At mouse down we want to wrap the value.
    };

    const touchMove = (e) => {
      const lastTouch = e.targetTouches.item(e.targetTouches.length - 1);
      move(lastTouch.clientX, lastTouch.clientY);
    };

    const touchStart = (e) => {
      e.preventDefault();
      // Have to attach to window here, if the user goes outside the window this picks up all events.
      window.addEventListener('touchmove', touchMove);
      window.addEventListener('touchend', end);
      window.addEventListener('touchcancel', end);
      const lastTouch = e.targetTouches.item(e.targetTouches.length - 1);
      move(lastTouch.clientX, lastTouch.clientY);
    };

    function cleanup() {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);
    }


    watchEffect(() => {
      // Start value does not automatically connect to the value of this slider, that's why there's a watcher here doing that for us :)
      angle.value = angleFromValue(props.start);
    });

    onUnmounted(() => cleanup());

    return {
      elSvg,
      moving,
      angle,
      maxAngle,
      path,
      containerStyle,
      current,
      knobX,
      knobY,
      knobRadius,

      circleStyle,
      click,
      mouseDown,
      touchStart,
    };
  },
};
</script>


<style scoped lang="less">
.circular-slider {
  position: relative;
  display: inline-block;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent; // To disable blue flash on android.

  // More style is calculated in the computed function containerStyle.
  background-repeat: no-repeat;

  &.disabled {
    color: inherit;
    opacity: var(--opacity-disabled);
    pointer-events: none;

    .knob {
      display: none;
    }
  }

  &.moving {
    /*
     * This is a tricky solution to stop the click event. We want to stop it so you cannot pull the knob further than start/end and then release the button.
     * If we set pointer-events to none, the event won't trigger after our mouseup event, but the other events will keep going since the are bound to the window.
     */
    pointer-events: none;
    cursor: -webkit-grab; // The prefixer doesn't do this one for some reason.
    cursor: grab;
    cursor: -webkit-grabbing; // The prefixer doesn't do this one for some reason.
    cursor: grabbing;
  }
}

.track,
.arc,
.knob {
  fill: none;
  transform-origin: center;
  stroke: var(--rgba-field);
}

.arc {
  stroke: rgb(var(--color-primary));
}

.knob {
  stroke: white;
  stroke-linecap: round;
  cursor: -webkit-grab; // The prefixer doesn't do this one for some reason.
  cursor: grab;
}

.value {
  position: absolute;
  left: 15%;
  right: 15%;
  top: 50%;
  text-align: center;
  transform: translateY(-55%);
  pointer-events: none;
}
</style>
