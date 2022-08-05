export const productCode = {
  p3: 'O-PC-3',
  pc: 'O-PC-2',
  pd: 'O-PD',
};

export const productUpdate = {
  p3: 'OPC3',
  pc: 'OPC',
  pd: 'OPD',
};

export const productTitle = {
  p3: 'Ochno Power Conference 3',
  pc: 'Ochno Power Conference 2',
  pd: 'Ochno Power Desktop',
  hub: 'Ochno Hub',
};

export const productUSB = {
  p3: { c: [1, 2, 3, 4], a: [5, 6] },
  pc: { c: [4, 3, 2, 1], a: [6, 5] },
  pd: { c: [4, 3, 2, 1], a: [6, 5] },
};

const prefixRegex = /^([^_]+)/;

export function productPrefix(serial) {
  const match = serial?.match(prefixRegex);
  return match && match[0];
}
