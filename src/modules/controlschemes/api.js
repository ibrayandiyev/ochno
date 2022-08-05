import axios from 'axios';

import buildAPI, { wrap } from '../utils/buildAPI';
import { MAX_FILE_SIZE, fileSizeCheck } from '../utils/fileUtils';

const api = buildAPI('controlschemes');

api.use = (id) => id && wrap(axios.get(`${api.route}/${id}/use`));
api.postImage = async (image) => { // eslint-disable-line arrow-body-style
  fileSizeCheck(image, MAX_FILE_SIZE.default);
  const formData = new FormData();
  formData.append('image', image, image.name);
  return wrap(axios.post(`${api.route}/image`, formData));
};

export default api;
