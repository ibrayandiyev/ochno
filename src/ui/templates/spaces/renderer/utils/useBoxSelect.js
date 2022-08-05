import pip from 'point-in-polygon';
import * as THREE from 'three';
import { reactive } from 'vue';
import workspaceStore, { TOOLS } from '../../../../../modules/workspace/store';

export default function useBoxSelect({ renderer, camera, items, onSelect }) {
  let controls;
  const boxSelect = reactive({
    active: false,
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  });

  function calculateSelection() {
    // Transform coordinates to position in scene (first to a vector, then to position relative to camera).
    const x1vec = (boxSelect.x1 / renderer.domElement.clientWidth) * 2 - 1;
    const x2vec = (boxSelect.x2 / renderer.domElement.clientWidth) * 2 - 1;
    const y1vec = -(boxSelect.y1 / renderer.domElement.clientHeight) * 2 + 1;
    const y2vec = -(boxSelect.y2 / renderer.domElement.clientHeight) * 2 + 1;
    const coords = [[x1vec, y1vec], [x2vec, y2vec]].map(([x, y]) => new THREE.Vector3(x, y, 0).unproject(camera));
    const points = [[coords[0].x, coords[0].y], [coords[1].x, coords[0].y], [coords[1].x, coords[1].y], [coords[0].x, coords[1].y]];
    const markers = items.value.filter(({ data }) => data.point && pip(data.point, points)).map(({ data }) => data.id);
    if (markers.length && onSelect) {
      onSelect(markers);
    }
  }

  function move(x, y) {
    boxSelect.active = true;
    boxSelect.x2 = x;
    boxSelect.y2 = y;
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

    if (controls) {
      controls.enablePan = true;
    }

    if (boxSelect.active) {
      calculateSelection();
      setTimeout(() => { // Need a timeout here to stop other clicks from firing.
        boxSelect.active = false;
      }, 50);
    }
  }

  function start(event) {
    if (workspaceStore.state.tool === TOOLS.box || event.shiftKey) {
      if (controls) {
        controls.enablePan = false;
      }

      if (event.type === 'touchstart') {
        const lastTouch = event.targetTouches.item(event.targetTouches.length - 1);
        boxSelect.x1 = lastTouch.clientX;
        boxSelect.y1 = lastTouch.clientY;
        window.addEventListener('touchmove', touchMove);
        window.addEventListener('touchend', end);
        window.addEventListener('touchcancel', end);
      } else {
        boxSelect.x1 = event.offsetX;
        boxSelect.y1 = event.offsetY;
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', end);
      }
    }
  }

  return {
    boxSelect,

    boxSelectStart: start,

    setControls(ctrls) {
      controls = ctrls;
    },
  };
}
