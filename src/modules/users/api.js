import axios from 'axios';

import buildAPI, { wrap } from '../utils/buildAPI';

const api = buildAPI('users');

api.postPicture = async (id, picture) => {
  const formData = new FormData();
  formData.append('picture', picture, picture.name);
  return id && wrap(axios.post(`${api.route}/${id}/picture`, formData));
};

export default api;
