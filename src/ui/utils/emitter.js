import mitt from 'mitt'; // https://github.com/developit/mitt

const emitter = mitt();

export default {
  $on: (...args) => emitter.on(...args),
  $off: (...args) => emitter.off(...args),
  $emit: (...args) => emitter.emit(...args),
};
