import buildAPI from '../utils/buildAPI';

const api = buildAPI('ports');

// No post for ports.
delete api.post;

export default api;
