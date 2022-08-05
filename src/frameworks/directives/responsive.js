import resizeDirective from './resize';

export default {
  mounted(el, binding) {
    const breakpoints = binding.value;

    if (!breakpoints || Object.values(breakpoints).find((bp) => typeof bp !== 'function')) {
      throw new Error('Responsive directive is only available when breakpoint values are functions.');
    }

    const newBinding = {
      value(target, contentRect) {
        Object.keys(breakpoints).forEach((className) => {
          const active = breakpoints[className](contentRect); // Running the function set in the directive.
          el.classList[active ? 'add' : 'remove'](className);
        });
      },
    };

    if (!binding.modifiers || !binding.modifiers.debounce) {
      newBinding.modifiers = { throttle: true };
    }

    resizeDirective.mounted(el, { ...binding, ...newBinding });
  },

  unmounted(...args) {
    resizeDirective.unmounted(...args);
  },
};
