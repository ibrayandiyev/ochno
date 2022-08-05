// Type
export const DEVICE = 'device';

// Paths/properties/capabilities
export const VID = 'vid';
export const PID = 'pid';
export const VOLTAGE = 'voltage';

export const DEVICE_PROPS = {
  [VID]: { type: String },
  [PID]: { type: String },
  [VOLTAGE]: { type: Number },
};
export const DEVICE_KEYS = Object.keys(DEVICE_PROPS);
