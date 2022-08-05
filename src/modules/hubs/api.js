import axios from 'axios';

import buildAPI, { wrap } from '../utils/buildAPI';

const api = buildAPI('hubs');

api.getHwId = (hwId) => hwId && wrap(axios.get(`${api.route}/hwId/${hwId}`));
api.getHwIdLog = (hwId) => hwId && wrap(axios.get(`${api.route}/hwId/${hwId}/log`));
api.getFirmware = (id) => id && wrap(axios.get(`${api.route}/${id}/firmware`));
api.putFirmware = (id, version) => id && wrap(axios.put(`${api.route}/${id}/firmware`, { version }));
api.putConfig = (id, config) => id && wrap(axios.put(`${api.route}/${id}/config`, config));
api.putReboot = (id) => id && wrap(axios.put(`${api.route}/${id}/reboot`));

export default api;
