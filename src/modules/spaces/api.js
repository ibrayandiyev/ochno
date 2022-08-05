import axios from 'axios';

import buildAPI, { wrap } from '../utils/buildAPI';
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES, fileSizeCheck, fileTypeCheck } from '../utils/fileUtils';

const api = buildAPI('spaces');

api.postImage = async (id, image) => { // eslint-disable-line arrow-body-style
  fileSizeCheck(image, MAX_FILE_SIZE.space);
  fileTypeCheck(image, SUPPORTED_FILE_TYPES.space);
  const formData = new FormData();
  formData.append('image', image, image.name);
  return id && wrap(axios.post(`${api.route}/${id}/image`, formData));
};

api.postAttributeImage = async (id, image, key = 'preview') => { // eslint-disable-line arrow-body-style
  fileSizeCheck(image, MAX_FILE_SIZE.default);
  const formData = new FormData();
  formData.append('image', image, image.name);
  return id && wrap(axios.post(`${api.route}/${id}/attributeImage/${key}`, formData));
};

api.iotAccess = (id) => id && wrap(axios.get(`${api.route}/${id}/iotAccess`));

export default api;
