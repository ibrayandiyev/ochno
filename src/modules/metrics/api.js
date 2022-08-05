import axios from 'axios';

import { wrap } from '../utils/buildAPI';
import buildQueryString from '../utils/buildQueryString';

const route = '/api/metrics';

export default {
  get: (measurement, query) => wrap(axios.get(`${route}/${measurement}?${buildQueryString(query)}`)),
};
