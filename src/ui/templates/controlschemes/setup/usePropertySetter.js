export const props = { control: { type: Object } };

export default function usePropertySetter(properties) {
  function setProperty(path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let obj = properties.control;
    parts.forEach((part) => {
      if (!obj[part]) {
        obj[part] = {};
      }
      obj = obj[part];
    });
    obj[last] = value;
  }

  return {
    setProperty,

    setParameter(path, value) {
      setProperty(`parameters.${path}`, value);
    },

    setCustomize(path, value) {
      setProperty(`parameters.customize.${path}`, value);
    },
  };
}
