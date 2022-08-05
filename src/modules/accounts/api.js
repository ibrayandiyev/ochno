import axios from 'axios';

import buildAPI, { wrap } from '../utils/buildAPI';

const api = buildAPI('accounts');

api.postImage = (id, image) => {
  const formData = new FormData();
  formData.append('image', image, image.name);
  return id && wrap(axios.post(`${api.route}/${id}/image`, formData));
};

api.groups = {
  get: (id) => id && wrap(axios.get(`${api.route}/${id}/groups`)),
  post: (id, data) => id && wrap(axios.post(`${api.route}/${id}/groups`, data)),
  getOne: (id, groupId) => id && wrap(axios.get(`${api.route}/${id}/groups/${groupId}`)),
  put: (id, groupId, data) => id && wrap(axios.put(`${api.route}/${id}/groups/${groupId}`, data)),
  delete: (id, groupId) => id && wrap(axios.delete(`${api.route}/${id}/groups/${groupId}`)),
};

export default api;
