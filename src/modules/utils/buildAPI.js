import axios from 'axios';

import buildQueryString from './buildQueryString';

export function responseData(response) {
  return response.data;
}

export function rethrow(e) {
  throw e; // Rethrow for promises waiting for data.
}

export function catchLog(e) {
  // console.warn(e); // eslint-disable-line no-console
  rethrow(e);
}

export function wrap(axiosFunc, catcher = catchLog) {
  return axiosFunc.then(responseData).catch(catcher);
}

export default function buildAPI(path) {
  const route = `/api/${path}`;

  return {
    route,
    get: (query) => wrap(axios.get(query ? `${route}?${buildQueryString(query)}` : `${route}`)),
    post: (data) => data && wrap(axios.post(`${route}`, data)),
    getOne: ({ id, query }) => id && wrap(axios.get(query ? `${route}/${id}?${buildQueryString(query)}` : `${route}/${id}`)),
    put: ({ id, data }) => id && wrap(axios.put(`${route}/${id}`, data)),
    delete: ({ id }) => id && wrap(axios.delete(`${route}/${id}`)),
  };
}
