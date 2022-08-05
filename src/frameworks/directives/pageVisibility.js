import VisibilityChange from 'vue-visibility-change';

const _id = Symbol('visibility-change-id');

export default {
  mounted(el, { value }) {
    if (typeof value === 'function') {
      el[_id] = VisibilityChange.change((evt, hidden) => value(!hidden, evt)); // eslint-disable-line no-param-reassign
    } else {
      console.warn('You need bind a callback function for page visibility directive'); // eslint-disable-line no-console
    }
  },

  unmounted(el) {
    VisibilityChange.unbind(el[_id]);
  },
};
