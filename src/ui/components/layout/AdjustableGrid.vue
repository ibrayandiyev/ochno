<!-- This file does not have a template part, instead see the render function returned from setup. -->

<script>
// NOTE: The foundation of this component is to calculate element boundaries and make it possible to move them.
// It works both horizontally and vertically, but only one way per component.
// It injects handles to be able to resize components automatically.

// NOTE: This was a real headache to implement. Some learnings made:
// 1) Vue rerenders elements that are in v-if on all renders, even if the expression hasn't changed.
// 2) Vue puts keys on conditional elements, but not other ones, regardless if they are comments or actual elements.
// 3) I chose to only use pixels, but a percentage unit (fr) would also be a valid choice.
//    The benefit with pixels is that the handle will always be in pixels and so is the resize events.
//    Converting these to percentages is not hard, but I've noticed flickering in the other components when I do (1 pixel shifting back and forth).
// 4) In the grid-template-... you cannot use fr as min value in minmax.

import { ref, watchEffect, h, resolveDirective, withDirectives, Comment, Fragment } from 'vue';

import AdjustableHandle from './AdjustableHandle.vue';

// const filterChild = ({ type, props }) => child.type !== Comment && (!props.style || props.style.display !== 'none');
const filterChild = ({ type, props }) => type !== Comment && (!props || props?.style?.display !== 'none');
const filterInited = (adjust) => adjust && adjust.size >= 0;
const filterDeform = (adjust) => adjust && adjust.deform;
const filterNoDeform = (adjust) => adjust && !adjust.deform;

export default {
  props: {
    vertical: { type: Boolean },
    // NOTE: There are also props for the children that are "secretly" used in the render function. These are:
    // min: { type: String } // A measurement for the smallest size of the component. Preferably use pixels, ex: '100px'.
    // init: { type: String } // A measurement for the preferred initial size.
  },

  emits: ['overrun'],

  setup(props, { slots, emit }) {
    const gridProp = props.vertical ? 'gridTemplateRows' : 'gridTemplateColumns';
    const sizeProp = props.vertical ? 'clientHeight' : 'clientWidth';
    const el = ref(null);
    let adjustables = [];

    function maxSize() {
      const size = el.value?.[sizeProp];
      return size && (size - ((adjustables.filter((val) => val).length - 1) * 3));
    }

    function propNumber(value) {
      const number = Number.parseFloat(value, 10);
      if (typeof value === 'string') {
        if (el.value && value.endsWith('px')) {
          return number || 0;
        }
      }
      // Number is percentage.
      return (number * (el.value[sizeProp] / 100)) || 0;
    }

    function shrink(adjust, amount) { // amount is in fr
      const newSize = adjust.size - amount;
      if (newSize < adjust.min) {
        adjust.size = adjust.min; // eslint-disable-line no-param-reassign
        return adjust.min - newSize;
      }
      adjust.size = newSize; // eslint-disable-line no-param-reassign
      return 0;
    }

    const reduceRemaining = (remain, adjust) => remain && shrink(adjust, remain);

    function move(index, change) {
      //                             Components before element             : Components after element
      const components = change < 0 ? adjustables.slice(0, index).reverse() : adjustables.slice(index + 1);
      const amount = Math.abs(change);
      // First remove the size from the deforming parts.
      let remaining = components.filter(filterDeform).reduce(reduceRemaining, amount);
      // Then remove the size from the other parts if there is any left.
      remaining = remaining && components.filter(filterNoDeform).reduce(reduceRemaining, remaining);
      return amount - remaining;
    }

    function alternate(before, after, size) {
      const remainBefore = before.reduce(reduceRemaining, Math.ceil(size / 2));
      let remaining = after.reduce(reduceRemaining, Math.floor(size / 2) + remainBefore);
      if (remaining && !remainBefore) {
        remaining = before.reduce(reduceRemaining, remaining);
      }
      return remaining;
    }

    function fit(index, amount, handleSize = (amount >= 0 ? 3 : -3)) {
      const before = adjustables.slice(0, index).reverse().filter(filterInited);
      const after = adjustables.slice(index + (amount >= 0 ? 1 : 0)).filter(filterInited);

      if (!(before.length + after.length)) {
        return amount;
      }
      // First remove the size from the deforming parts.
      const handles = handleSize * (!!before.length + !!after.length);
      let remaining = alternate(before.filter(filterDeform), after.filter(filterDeform), amount + handles);
      // Then remove the size from the other parts if there is any left.
      remaining = remaining && alternate(before.filter(filterNoDeform), after.filter(filterNoDeform), remaining);
      return amount - remaining;
    }

    function validate() {
      const active = adjustables.filter(filterInited);
      const total = active.reduce((sum, { size }) => sum + size, 0);
      const max = maxSize();

      if (!total) { // Strange case where all parts are 0.
        active.forEach((adjust) => {
          adjust.size = max / active.length; // eslint-disable-line no-param-reassign
        });
      } else {
        const factor = total / max;
        if (factor !== 1) {
          active.forEach((adjust) => {
            adjust.size = Math.round(adjust.size / factor); // eslint-disable-line no-param-reassign
          });
        }
      }

      const min = active.reduce((sum, act) => sum + act.min, 0);
      if (min > max) {
        emit('overrun', { px: min - max });
      } else {
        adjustables.forEach((adjust, index) => {
          if (adjust && adjust.size < adjust.min) {
            const overshoot = adjust.min - adjust.size;
            adjust.size = adjust.min; // eslint-disable-line no-param-reassign
            fit(index, overshoot, 0);
          }
        });
      }
    }

    function setStyle() {
      if (el.value) {
        // The handle is set to 0 to make calculations waaay easier. And it shouldn't be a big problem anyway since all children should have some padding.
        el.value.style[gridProp] = `${adjustables.filter(filterInited).map(({ min, size }) => `minmax(${min}px, ${size}px)`).join(' 3px ')}`;
      }
    }

    function updateGrid() {
      validate();
      setStyle();
    }

    function resize({ handle, change }) {
      if (change) {
        const active = adjustables.filter((val) => val);
        const index = adjustables.indexOf(active[handle + (change < 0)]); // boolean expression will become 0 or 1.
        adjustables[index].size += move(index, change);
        updateGrid();
      }
    }

    function gridResized() {
      updateGrid();
    }

    function getChildren() {
      const slot = Array.from(slots.default());
      return slot.reduce((all, cur) => all.concat(cur.type === Fragment ? cur.children : cur), []);
    }

    watchEffect(() => {
      if (!el.value) {
        return;
      }

      const old = adjustables;

      adjustables = getChildren().map((child, index) => {
        if (filterChild(child)) {
          return Object.assign(adjustables[index] || {}, {
            min: propNumber(child.props?.min),
            init: propNumber(child.props?.init),
          });
        }
        return null;
      });

      const active = adjustables.filter((val) => val);
      if (!old.length) {
        // First time this is called.
        const hasInit = active.filter(({ init }) => init);
        const leftover = hasInit.reduce((left, { init }) => left - init, maxSize());
        const generalInit = Math.round(leftover / ((active.length - hasInit.length)) || 1);
        active.forEach((adjust) => {
          adjust.size = adjust.init || generalInit; // eslint-disable-line no-param-reassign
        });
      } else {
        old.forEach((adj, index) => adj && !adjustables[index] && fit(index, -adj.size)); // Check for removed components.
        adjustables.forEach((adjust, index) => { // Check for added components.
          if (adjust && !(adjust.size >= 0)) {
            adjust.size = fit(index, adjust.init || (maxSize() / active.length)); // eslint-disable-line no-param-reassign
          }
        });
      }

      updateGrid();
    });

    return () => {
      const components = getChildren().filter(filterChild);
      const options = { vertical: props.vertical, onResize: resize };
      const children = components.reduce((all, component, i) => all.concat(i ? [h(AdjustableHandle, { ...options, handle: i - 1 }), component] : [component]), []);

      return withDirectives(h(
        'div',
        { ref: el, class: 'adjustable-grid' },
        children,
      ), [
        [resolveDirective('resize'), gridResized, 'resize', { throttle: true, 200: 'delay' }],
      ]);
    };
  },
};
</script>

<style scoped lang="less">
.adjustable-grid {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
