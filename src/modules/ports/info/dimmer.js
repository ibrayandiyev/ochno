// Type
export const DIMMER = 'dimmer';

// Paths/properties/capabilities
export const CLICKED = 'clicked';
export const DIMMING = 'dimming';

export const DIMMER_PROPS = {
  [DIMMING]: { type: Number },
  [CLICKED]: { type: Boolean },
};
export const DIMMER_KEYS = Object.keys(DIMMER_PROPS);

// Subtypes
export const DIMMER_SUBTYPE_PROPS = {
  [DIMMER]: [DIMMING, CLICKED], // Default value.
};
export const DIMMER_SUBTYPES = Object.keys(DIMMER_SUBTYPE_PROPS);
