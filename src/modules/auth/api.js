import axios from 'axios';

import { wrap, rethrow } from '../utils/buildAPI';

const route = '/auth';

export default {
  login: (credentials) => wrap(axios.post(`${route}/login`, credentials)),
  logout: () => wrap(axios.get(`${route}/logout`)),
  userdata: () => wrap(axios.get(`${route}/user/data`), rethrow),
  forgot: (email, routeTo) => wrap(axios.post(`${route}/user/forgot`, { email, route: routeTo })),
  getReset: (token) => wrap(axios.get(`${route}/user/reset/${token}`)),
  reset: (token, password) => wrap(axios.post(`${route}/user/reset/${token}`, { password })),
  setHeaders: (jwt) => {
    if (jwt) {
      axios.defaults.headers.common.Authorization = `JWT ${jwt}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  },
};
