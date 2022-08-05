import axios from 'axios';

import buildAPI, { wrap } from '../utils/buildAPI';

const api = buildAPI('mechanisms');

api.putState = (id, state) => id && wrap(axios.put(`${api.route}/${id}/state`, state));

export default api;
