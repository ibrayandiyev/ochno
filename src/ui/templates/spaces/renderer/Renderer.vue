<template>
  <div
    ref="canvasEl"
    class="map-editor fill-height relative"
    v-resize.throttle.100="resize"
    @click="mapClick"
    @dblclick="zoomIn"
    @mousedown="boxSelectStart"
    @touchstart="boxSelectStart"
  >
    <div class="markers">
      <component
        v-for="{ component, data, classes } in items"
        :key="data.id"
        :is="component"
        ref="markersEl"
        v-bind="data"
        :space-id="spaceId"
        :editable="editable"
        :class="classes"
        @click="itemClick"
        @drag-start="itemDragStart"
        @drag-move="itemDragMove"
        @drag-end="itemDragEnd"
      />
    </div>

    <div v-if="boxSelect.active" class="absolute fill is-disabled">
      <svg class="box-select" width="100%" height="100%">
        <polygon :points="`${boxSelect.x1}, ${boxSelect.y1} ${boxSelect.x2}, ${boxSelect.y1} ${boxSelect.x2}, ${boxSelect.y2} ${boxSelect.x1}, ${boxSelect.y2}`" />
      </svg>
    </div>

    <Spinner v-if="progress < 100" :text="progress ? progress.toString() : ''" class="fill centered" />
  </div>
</template>


<script>
// Documentation:
// Three.js: https://threejs.org/docs
import _ from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

import loaders from './loaders';
import { components, markerMap } from './markers';
import snapshot from './utils/snapshot';
import useBoxSelect from './utils/useBoxSelect';
import emitter from '../../../utils/emitter';
import { showError } from '../../../utils/error';
import spacesStore from '../../../../modules/spaces/store';
import workspaceStore from '../../../../modules/workspace/store';

export default {
  components,

  props: {
    spaceId: { type: String, required: true },
    editable: { type: Boolean, default: false },
  },

  emits: ['item-click', 'item-dragged', 'map-click', 'box-select'],

  setup(props, { emit }) {
    let renderer = null;

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.domElement.style.display = 'block'; // The canvas needs to be a block otherwise it will add 4px height to the parent.
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
      showError({ message: 'Your space could not be shown. webGL support might be missing in your browser.' });
    }

    const scene = new THREE.Scene();
    scene.scale.set(1, 1, 1);

    const camera = new THREE.OrthographicCamera(-512, 512, 512, -512, 1, 10000); // "2d"-camera.
    camera.position.set(0, 0, 1);

    let controls; // Controls is setup in onMounted - Needs access to the correct element.
    const moving = ref(false);
    const dragging = ref(false);

    const canvasEl = ref(null);
    const markersEl = ref(null);

    const { filterItems } = spacesStore.getters;
    const { getItemChoice } = workspaceStore.getters;

    const space = computed(() => spacesStore.state.spaces[props.spaceId]);
    const items = computed(() => space.value.items.map((data) => {
      const { id, type } = data;
      const component = markerMap[type]; // || MarkerItem;
      if (!component) {
        return null;
      }
      const classes = Object.keys(getItemChoice.value(id)).join(' ');
      return { component, data, classes };
    }).filter((value) => value));

    const { boxSelect, boxSelectStart, setControls } = useBoxSelect({ renderer, camera, items, onSelect: (markers) => emit('box-select', markers) });

    function render() {
      renderer.render(scene, camera);
    }

    function animate() {
      render();
      requestAnimationFrame(animate);

      markersEl.value?.forEach(({ point, el }) => {
        if (point) {
          const coord = new THREE.Vector3(point[0], point[1], 0);
          coord.project(camera);
          el.style.transform = `translate(${((coord.x * 0.5) + 0.5) * canvasEl.value.clientWidth}px, ${((coord.y * -0.5) + 0.5) * canvasEl.value.clientHeight}px)`; // eslint-disable-line no-param-reassign
        }
      });
    }

    function updateSize() {
      const container = renderer.domElement?.parentElement;
      if (container) {
        const size = { x: container.clientWidth, y: container.clientHeight };
        const currentSize = new THREE.Vector2();
        renderer.getSize(currentSize);

        if (currentSize.x !== size.x || currentSize.y !== size.y) {
          renderer.setSize(size.x, size.y);
          camera.left = -size.x / 2;
          camera.right = size.x / 2;
          camera.top = size.y / 2;
          camera.bottom = -size.y / 2;
          camera.updateProjectionMatrix();
        }

        render();
      }
    }

    const zoomIn = () => {
      // TODO: Zoom in where cursor is.
      camera.zoom += 0.1;
      camera.updateProjectionMatrix();
    };

    const zoomOut = () => {
      camera.zoom -= 0.1;
      camera.updateProjectionMatrix();
    };

    const zoomFit = () => {
      camera.position.set(0, 0, 1);
      controls?.target?.set(0, 0, 1);
      const bounds = new THREE.Box3().setFromObject(scene);
      const camWidth = camera.right - camera.left;
      const camHeight = camera.top - camera.bottom;
      const boundWidth = Math.max(-bounds.min.x, bounds.max.x, camWidth / 2) * 2;
      const boundHeight = Math.max(-bounds.min.y, bounds.max.y, camHeight / 2) * 2;
      camera.zoom = Math.min(camWidth / boundWidth, camHeight / boundHeight);
      camera.updateProjectionMatrix();
    };

    const resize = () => {
      updateSize();
      // zoomFit();
    };

    const mapClick = (event) => {
      if (!moving.value && !dragging.value && !boxSelect.active && event.target === renderer.domElement) {
        emit('map-click', event);
      }
    };

    const itemClick = (event) => {
      if (!moving.value && !dragging.value && !boxSelect.active) {
        emit('item-click', event);
      }
    };

    const itemDragStart = () => {
      if (controls) {
        controls.enablePan = false;
      }
      dragging.value = true;
    };

    const itemDragMove = ({ el, x, y }) => {
      const xPoint = (x / renderer.domElement.clientWidth) * 2 - 1;
      const yPoint = -(y / renderer.domElement.clientHeight) * 2 + 1;
      const coords = new THREE.Vector3(xPoint, yPoint, 0).unproject(camera);
      el.point[0] = Math.round(coords.x); // eslint-disable-line no-param-reassign
      el.point[1] = Math.round(coords.y); // eslint-disable-line no-param-reassign
    };

    const itemDragEnd = (event) => {
      if (controls) {
        controls.enablePan = true;
      }
      setTimeout(() => {
        dragging.value = false;
      }, 50);
      emit('item-dragged', event);
    };

    // Load all images for the space and watch for changes (user might upload or edit current images)
    const spaceImages = computed(() => filterItems.value({ id: props.spaceId, type: 'image' }));
    const imageLoad = ref([]);
    let updatePreview;
    let previewTimeout;

    watch(
      () => spaceImages.value,
      (newValue, oldValue) => {
        // This is a bit complicated, but necessary so that the imageLoad is only updated when the images are actually changed,
        // not when anything in the space is changed (like moving a port).
        if (!_.isEqual(newValue, oldValue)) {
          imageLoad.value = newValue.map((imgItem) => loaders(imgItem));
          if (oldValue) {
            clearTimeout(previewTimeout);
            updatePreview = true;
          }
        } else {
          updatePreview = false;
        }
      },
      { immediate: true },
    );

    watch(
      () => imageLoad.value,
      (newValue) => {
        scene.clear();

        Promise.all(newValue.map(async ({ loader }, index) => {
          try {
            const loaded = await loader;
            loaded.renderOrder = index; // To make images stack properly.
            scene.add(loaded);
          } catch (error) {
            // TODO: Show proper error.
            console.log(error); // eslint-disable-line no-console
          }
        })).then(() => {
          zoomFit();

          // TODO: This should preferably be moved to the server.
          // TODO: This will be relative to the client size.
          if (!space.value?.attributes?.preview || updatePreview) {
            previewTimeout = setTimeout(async () => { // Waiting for the canvas to have drawn so we have something to save, this is a very crude way to do this.
              try {
                const file = await snapshot(renderer.domElement, space.value.id);
                await spacesStore.dispatch.postAttributeImage({ id: space.value.id, data: file, key: 'preview' });
              } catch (error) {
                console.warn(error); // eslint-disable-line no-console
              }
            }, spaceImages.value.length ? 200 : 5000);
          }
        });
      },
      { immediate: true },
    );

    onMounted(() => {
      if (renderer) {
        canvasEl.value.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, canvasEl.value); // Binding controls to parent so it can capture bubbling "drag" events from markers.
        controls.target.set(0, 0, 1);
        controls.enableRotate = false;
        controls.zoomSpeed = 3;
        controls.mouseButtons = {
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
        };
        controls.touches = {
          ONE: THREE.TOUCH.PAN,
        };
        // The "click" event is always triggered, whether controls have moved or not, so need this workaround.
        controls.addEventListener('change', () => {
          moving.value = true;
        });
        controls.addEventListener('end', () => moving.value && setTimeout(() => {
          moving.value = false;
        }, 50));
        setControls(controls);

        updateSize();
        animate();

        // Listen to general message bus.
        emitter.$on('map-zoom-in', () => zoomIn());
        emitter.$on('map-zoom-out', () => zoomOut());
        emitter.$on('map-zoom-fit', () => zoomFit());
      }
    });

    onUnmounted(() => {
      clearTimeout(previewTimeout);
      emitter.$off('map-zoom-in');
      emitter.$off('map-zoom-out');
      emitter.$off('map-zoom-fit');
    });

    return {
      canvasEl,
      markersEl,

      items,
      boxSelect,
      progress: computed(() => (imageLoad.value?.length ? parseInt(_.meanBy(imageLoad, 'value.progress.value'), 10) : 100)),

      resize,
      zoomIn,
      mapClick,
      itemClick,
      itemDragStart,
      itemDragMove,
      itemDragEnd,
      boxSelectStart,
    };
  },
};
</script>


<style scoped lang="less">
.markers {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;

  &:deep(.marker) {
    position: relative;
    width: 0 !important;
    height: 0 !important;
    color: rgb(var(--color-primary)); // To set the color that the border will use as inherit.
    border-radius: 50%;
    cursor: pointer;
    pointer-events: auto;

    --ring-size: 3px;
    --ring-offset: calc(var(--ring-size) + 2px);

    &:before,
    > .icon {
      // Need this to line up icon and before (border) properly.
      font-size: 20px;
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%);
    }

    &:before {
      content: '';
      display: none;
      box-sizing: border-box;
      width: calc(var(--icon-size) + var(--ring-offset) * 2);
      height: calc(var(--icon-size) + var(--ring-offset) * 2);
      border: var(--ring-size) solid;
      border-color: inherit;
      border-radius: 50%;
    }

    .auto-fr-grid {
      column-gap: 0.75rem;
      row-gap: 1.5rem;
    }

    /* STATES */
    &:hover {
      z-index: 2;

      &:before {
        display: block;
      }
    }

    &.selection {
      z-index: 1;
    }
  }

  &:deep(.polygon) {
    margin: 0 !important;
    width: 0 !important;
    height: 0 !important;
    color: rgb(var(--color-nature));

    .icon-wrapper {
      font-size: 0.9em;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      width: calc(var(--icon-size) * 2);
      height: calc(var(--icon-size) * 2);
      margin-top: calc(var(--icon-size) * -2);
      border-radius: 0.5em 0.5em 0 0;
      background: rgb(var(--color-gray-5));

      .icon {
        margin-top: 1px;
      }
    }

    // STATES
    &.hover,
    &.selection,
    &.highlighting {
      .icon-wrapper {
        background: rgb(var(--color-primary));
      }
    }
  }
}

.box-select {
  fill: rgba(255, 255, 255, 0.4);
  stroke: rgba(var(--color-orange-lighter), 1);
  stroke-width: 3px;
  stroke-dasharray: 6px 4px;
}

// STATES
 // NOTE: has-editing, has-highlighting and has-selection is set in another component.
.map:not(.has-editing):not(.has-highlighting) {
  .map-editor:deep(.markers) {
    .icon-devicePort {
      --rgba-icon-shadow: rgb(var(--color-gray-2a));
      --rgba-icon-bg: rgb(var(--color-gray-4));
    }
  }
}

.has-editing,
.has-highlighting {
   .map-editor:deep(.markers) {
     .marker:not(.highlighting):not(.editing) {
       --rgba-icon-shadow: rgb(var(--color-gray-4));
       --rgba-icon-bg: rgb(var(--color-gray-5));
       color: rgb(var(--color-gray-5));
     }
   }
}

.has-editing {
  .map-editor:deep(.markers) {
    .marker.editing:before {
      display: block;
    }
  }
}

.has-selection:not(.has-editing) {
  .map-editor:deep(.markers) {
    .marker {
      &.selection:before {
        display: block;
      }

      &:not(.selection):not(.highlighting) {
        --rgba-icon-shadow: rgb(var(--color-gray-4));
        --rgba-icon-bg: rgb(var(--color-gray-5));
        color: rgb(var(--color-gray-5));
      }
    }
  }
}
</style>
