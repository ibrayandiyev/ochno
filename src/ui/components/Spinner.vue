<template>
  <div class="spinner grid">
    <svg class="holder">
      <circle class="track" />
      <circle class="stroke" />
    </svg>
    <h3 v-if="text" class="text">
      {{ text }}
    </h3>
  </div>
</template>


<script>
export default {
  props: {
    text: { type: String },
  },
};
</script>


<style scoped lang="less">
.spinner {
  --spinner-mid: calc(var(--spinner) / 2);
  --spinner-width: calc(var(--spinner) / 6);
  --spinner-r: calc((var(--spinner) - var(--spinner-width)) / 2);
  --spinner-b: calc(var(--spinner-r) * 3.1415);
  --spinner-c: calc(var(--spinner-b) * 2);

  justify-content: center;
  justify-items: center;
  align-content: center;
  row-gap: var(--column-gap);

  opacity: 0;
  transform-origin: 0 0;
  animation: fade-to-1 2s forwards;
  z-index: 901;

  &.fill {
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(var(--color-black), var(--opacity-heavy));
  }

  &.inline,
  &.inset {
    display: inline-grid;
    grid-template-columns: auto auto;
    justify-content: flex-start;
  }
  &.inline {
    --spinner: var(--field-size);
  }
  &.inset {
    --spinner: var(--box-size);
  }
}

.holder {
  width: var(--spinner);
  height: var(--spinner);
}

.track,
.stroke {
  cx: var(--spinner-mid);
  cy: var(--spinner-mid);
  r: var(--spinner-r);

  fill: transparent;
  stroke: rgba(var(--color-white), var(--opacity-medium));
  stroke-width: var(--spinner-width);
}

.stroke {
  stroke: rgb(var(--color-primary));
  stroke-dasharray: var(--spinner-c);
  stroke-dashoffset: var(--spinner-c);
  transform-origin: 50% 50%;
  transform: rotateZ(-90deg);
  animation: stroke 2s infinite ease;
}

@keyframes stroke {
  0 {
    transform: rotateZ(-90deg);
    stroke-dashoffset: var(--spinner-c);
  }
  25% {
    transform: rotateZ(-90deg);
    stroke-dashoffset: var(--spinner-b);
  }
  50% {
    transform: rotateZ(90deg);
    stroke-dashoffset: var(--spinner-c);
  }
  75% {
    transform: rotateZ(90deg);
    stroke-dashoffset: var(--spinner-b);
  }
  100% {
    transform: rotateZ(270deg);
    stroke-dashoffset: var(--spinner-c);
  }
}
</style>
