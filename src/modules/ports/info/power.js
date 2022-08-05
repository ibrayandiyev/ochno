// Type
export const POWER = 'power';

// Paths/properties/capabilities
export const DIRECTION = 'direction';
export const WATT = 'watt';

export const POWER_PROPS = {
  [DIRECTION]: { type: String },
  [WATT]: { type: Number },
};
export const POWER_KEYS = Object.keys(POWER_PROPS);
