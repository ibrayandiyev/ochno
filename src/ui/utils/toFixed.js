export default (num, precision = 0) => (Number.isFinite(num) ? num : num.toFixed(precision));
