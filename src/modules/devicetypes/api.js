import axios from 'axios';

import buildAPI, { wrap } from '../utils/buildAPI';
import buildQueryString from '../utils/buildQueryString';

const api = buildAPI('devicetypes');

api.match = (query) => wrap(axios.get(`${api.route}/match/device?${buildQueryString(query)}`));
api.postImage = (id, image) => {
  const formData = new FormData();
  formData.append('image', image, image.name);
  return id && wrap(axios.post(`${api.route}/${id}/image`, formData));
};

export default api;
