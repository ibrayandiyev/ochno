/* global Android */

export default (() => {
  try {
    return Android;
  } catch (e) {
    return undefined;
  }
})();
