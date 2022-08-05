import axios from 'axios';

import { responseData } from '../../utils/buildAPI';

function wrap(axiosFunc) {
  // Do not use a catcher, since it will write to log all the time...
  return axiosFunc.then(responseData);
}

const req = axios.create({
  baseURL: 'https://edge.ochno.com:3003',
});

const routes = {
  auth: 'api/auth/',
  edge: 'api/edge/',
  gg: 'api/gg/',
  network: 'api/network/',
};

export default {
  auth: {
    setup: ({ username, password }) => wrap(req.post(`${routes.auth}setup`, { username, password })),
    login: async ({ username, password }) => {
      const { token } = await wrap(req.post(`${routes.auth}login`, { username, password }));
      req.defaults.headers.common.Authorization = `JWT ${token}`;
    },
    logout: () => wrap(req.get(`${routes.auth}logout`)),
  },

  edge: {
    get: () => wrap(req.get(routes.edge)),
    info: () => wrap(req.get(`${routes.edge}info`)),
    reset: () => wrap(req.get(`${routes.edge}reset`)),
  },

  gg: {
    get: () => wrap(req.get(routes.gg)),
    post: ({ configuration, files }) => wrap(req.post(routes.gg, { configuration, files })),
  },

  network: {
    get: () => wrap(req.get(routes.network)),
    post: ({ ssid, password }) => wrap(req.post(routes.network, { ssid, password })),
  },
};
