import axios from 'axios';

import buildAPI, { wrap } from '../utils/buildAPI';

const api = buildAPI('edges');

api.getHwId = (hwId) => hwId && wrap(axios.get(`${api.route}/hwId/${hwId}`));
api.putDeploy = (id, options) => id && wrap(axios.put(`${api.route}/${id}/deploy`, options));

export default api;
