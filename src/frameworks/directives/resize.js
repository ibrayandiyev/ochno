import _ from 'lodash';

const defaultdelay = 200;

export default {
  mounted(el, { value, modifiers = {} } = {}) {
    if (!value || typeof value !== 'function') {
      throw new Error('Resize directive is only available with a function value.');
    }

    function onResize(entries) {
      const { target, contentRect } = entries[0];
      value(target, contentRect);
    }

    const trigger = (modifiers.throttle && _.throttle) || (modifiers.debounce && _.debounce);
    const delay = Object.keys(modifiers).find((key) => !Number.isNaN(Number.parseInt(key, 10))) || defaultdelay;

    // Not very nice to put stuff on the element, but vue recommends "el.dataset" and that can only store strings.
    el.resizeObserver = new ResizeObserver(trigger ? trigger(onResize, delay) : onResize); // eslint-disable-line no-param-reassign
    el.resizeObserver.observe(el);
  },

  unmounted(el) {
    if (el.resizeObserver) { // It might not be set if an error was thrown.
      el.resizeObserver.unobserve(el);
    }
  },
};
