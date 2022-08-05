<template>
  <div ref="el" class="section-marker marker">
    <!-- TODO -->
  </div>
</template>


<script>
import { ref, watchEffect } from 'vue';

export default {
  props: {
    id: { type: String, required: true },
    points: { type: Array, default: () => [[1, 0], [1, 1], [0, 1]] },
    editable: { type: Boolean, default: false },
  },

  setup(props) {
    const el = ref(null);

    watchEffect(() => {
      if (el.value) {
        el.value.points = props.points;
      }
    });

    return {
      el,
    };
  },
};
</script>


<style scoped lang="less">
// .leaflet-overlay-pane .leaflet-interactive { // Sections
//   stroke: rgb(var(--color-gray-5));
//   stroke-dasharray: 6px 7px;
//   fill-opacity: 0;
//   pointer-events: none; // TODO: Any way to set the polygon to not be interactive?
//
//   &.hover,
//   &.selection,
//   &.highlighting,
//   &.editing {
//     stroke: rgb(var(--color-primary));
//   }
//
//   &.selection,
//   &.editing {
//     stroke-dasharray: none;
//   }
// }
</style>
