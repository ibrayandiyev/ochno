// Type
export const LAMP = 'lamp';

// Paths/properties/capabilities
export const LEVEL = 'level';
export const TEMP = 'temp';
export const RED = 'red';
export const GREEN = 'green';
export const BLUE = 'blue';
export const ALT_LEVEL = 'altlevel';
export const ALT_TEMP = 'alttemp';
export const ALT_RED = 'altred';
export const ALT_GREEN = 'altgreen';
export const ALT_BLUE = 'altblue';

export const levelMin = 0;
export const levelMax = 100;
export const tempMin = 2700;
export const tempMax = 5700;
export const rgbMin = 0;
export const rgbMax = 255;

export const LAMP_PROPS = {
  [LEVEL]: { type: Number, min: levelMin, max: levelMax },
  [TEMP]: { type: Number, min: tempMin, max: tempMax },
  [RED]: { type: Number, min: rgbMin, max: rgbMax },
  [GREEN]: { type: Number, min: rgbMin, max: rgbMax },
  [BLUE]: { type: Number, min: rgbMin, max: rgbMax },

  [ALT_LEVEL]: { type: Number, min: levelMin, max: levelMax },
  [ALT_TEMP]: { type: Number, min: tempMin, max: tempMax },
  [ALT_RED]: { type: Number, min: rgbMin, max: rgbMax },
  [ALT_GREEN]: { type: Number, min: rgbMin, max: rgbMax },
  [ALT_BLUE]: { type: Number, min: rgbMin, max: rgbMax },
};
export const LAMP_KEYS = Object.keys(LAMP_PROPS);


// Subtypes
export const HCL_LAMP = 'hcllamp';
export const BI_DIR_LAMP = 'bidirlamp';
export const BI_DIR_HCL_LAMP = 'bidirhcllamp';

export const LAMP_SUBTYPE_PROPS = {
  [LAMP]: [LEVEL], // Default value.
  [HCL_LAMP]: [LEVEL, TEMP],
  [BI_DIR_LAMP]: [LEVEL, ALT_LEVEL],
  [BI_DIR_HCL_LAMP]: [LEVEL, TEMP, ALT_LEVEL, ALT_TEMP],
};
export const LAMP_SUBTYPES = Object.keys(LAMP_SUBTYPE_PROPS);
