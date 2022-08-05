// Type
export const BUTTON = 'button';

// Paths/properties/capabilities
export const PUSHED = 'pushed';
export const ACTIVE_PORT = 'activeport';

export const BUTTON_PROPS = {
  [PUSHED]: { type: Boolean },
  [ACTIVE_PORT]: { type: String },
};
export const BUTTON_KEYS = Object.keys(BUTTON_PROPS);

// Subtypes
export const BUTTON_SUBTYPE_PROPS = {
  [BUTTON]: [PUSHED, ACTIVE_PORT], // Default value.
};
export const BUTTON_SUBTYPES = Object.keys(BUTTON_SUBTYPE_PROPS);
