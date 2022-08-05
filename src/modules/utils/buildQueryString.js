export default function buildQueryString(obj) {
  if (typeof obj === 'string') {
    return obj;
  }

  return Object.entries(obj)
    .map(([key, value]) => {
      if (Array.isArray(value)) { // Split arrays into multiple parameters.
        return value.map((val) => `${key}=${val}`).join('&');
      }
      return `${key}=${value}`;
    })
    .join('&');
}
