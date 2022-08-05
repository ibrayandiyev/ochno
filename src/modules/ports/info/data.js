// This is not a specific type, rather it is in the "base" of the port data.
// Type
export const DATA = 'port';

// Paths/properties/capabilities
export const CONNECTED = 'connected';
export const ENABLED = 'enabled';

export const DATA_PROPS = {
  [CONNECTED]: { type: Boolean },
  [ENABLED]: { type: Boolean },
};
export const DATA_KEYS = Object.keys(DATA_PROPS);
