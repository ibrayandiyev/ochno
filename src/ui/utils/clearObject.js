export default function clearObject(obj) {
  if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => delete obj[key]); // eslint-disable-line no-param-reassign
  }
}
