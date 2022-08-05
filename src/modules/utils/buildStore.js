import _ from 'lodash';
import { normalize, denormalize } from 'normalizr';
import { reactive, computed } from 'vue';

export default function buildStore({ api, normalization, validation, postProcess }) {
  const name = normalization.key;

  const state = reactive({
    [name]: {},
    ids: [],
    fetching: false,
    saving: false,
  });

  const getters = {
    full: computed(() => (id) => denormalize(_.get(state, `${name}.${id}`), normalization, state)),
    find: computed(() => (finder, { prop = name } = {}) => _.find(state[prop], finder)),
    findPath: computed(() => (finder, path = 'id', { prop = name } = {}) => _.get(_.find(state[prop], finder), path)),
    mapPaths: computed(() => (ids, path = 'id', { prop = name } = {}) => _.map(_.pick(state[prop], ids), path)),
  };

  function upsert({ entities, result }) {
    if (result.length) {
      state.ids = _.union(state.ids, result); // eslint-disable-line no-param-reassign
      Object.entries(entities).forEach(([key, value]) => {
        if (!state[key]) {
          state[key] = value;
        } else {
          Object.entries(entities[key]).forEach(([id, data]) => {
            if (!_.isEqual(state[key][id], data)) { // Just to avoid reactivity retriggering.
              state[key][id] = data;
            }
          });
        }
      });

      if (postProcess) {
        postProcess({ entities, result });
      }
    }
  }

  function setter(item, func) {
    const norm = normalize(item, normalization);
    const { entities } = norm;
    const id = item.id;
    Object.keys(entities).forEach((key) => {
      const stateValue = _.get(state[key], id, {});
      const newValue = func({}, stateValue, entities[key][id]);
      if (_.isEqual(newValue, stateValue)) {
        delete entities[key][id];
      } else {
        entities[key][id] = newValue;
        Object.entries(newValue).forEach(([prop, value]) => {
          if (value === null && state[prop]) {
            _.set(entities, `${prop}.${id}`, null);
          }
        });
      }
    });
    upsert(norm);
  }

  async function run(dataPromise, { pending = 'saving', update = true } = {}) {
    state[pending] = true;
    try {
      const retval = await dataPromise;
      state[pending] = false;
      if (update && retval) {
        upsert(normalize(_.castArray(retval), [normalization]));
      }
      return retval;
    } catch (error) {
      state[pending] = false;
      throw error;
    }
  }

  function remove({ id } = {}) {
    const index = state.ids.indexOf(id);
    if (index >= 0) {
      state.ids.splice(index, 1);
    }

    Object.keys(state).forEach((key) => {
      if (_.isObject(state[key])) {
        delete state[key][id];
      }
    });

    return true;
  }

  const dispatch = {
    run,
    assign: (item) => setter(item, _.assign),
    merge: (item) => setter(item, _.merge),
  };

  if (api.get) {
    dispatch.get = (...args) => run(api.get(...args), { pending: 'fetching' });
  }
  if (api.getOne) {
    dispatch.getOne = (...args) => run(api.getOne(...args), { pending: 'fetching' });
  }
  if (api.post) {
    dispatch.post = (...args) => run(api.post(...args));
  }
  if (api.put) {
    dispatch.put = (...args) => run(api.put(...args));
  }
  if (api.delete) {
    dispatch.delete = (...args) => run(api.delete(...args), { update: false }).then(() => remove(...args));
  }

  return {
    name,
    state,
    getters,
    dispatch,
    validation,
  };
}
