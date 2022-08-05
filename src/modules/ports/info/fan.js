// Type
export const FAN = 'fan';

// Paths/properties/capabilities
export const RPM = 'rpm';
export const RPM1 = `${RPM}1`;
export const RPM2 = `${RPM}2`;
export const RPM3 = `${RPM}3`;
export const RPM4 = `${RPM}4`;

export const TARGET = 'target';
export const TARGET1 = `${TARGET}1`;
export const TARGET2 = `${TARGET}2`;
export const TARGET3 = `${TARGET}3`;
export const TARGET4 = `${TARGET}4`;

// Technically this limit is a bit bizarre, it's set too high by design, but made to not make hacking a huge number into the property.
export const rpmMin = -(2 ** 16) - 1; // 2^16
export const rpmMax = -rpmMin;
export const targetMin = 0;
export const targetMax = 100;

export const RPM_PROPS = {
  [RPM1]: { type: Number, min: rpmMin, max: rpmMax },
  [RPM2]: { type: Number, min: rpmMin, max: rpmMax },
  [RPM3]: { type: Number, min: rpmMin, max: rpmMax },
  [RPM4]: { type: Number, min: rpmMin, max: rpmMax },
};
export const RPM_KEYS = Object.keys(RPM_PROPS);

export const TARGET_PROPS = {
  [TARGET1]: { type: Number, min: targetMin, max: targetMax },
  [TARGET2]: { type: Number, min: targetMin, max: targetMax },
  [TARGET3]: { type: Number, min: targetMin, max: targetMax },
  [TARGET4]: { type: Number, min: targetMin, max: targetMax },
};
export const TARGET_KEYS = Object.keys(TARGET_PROPS);

export const FAN_PROPS = { ...RPM_PROPS, ...TARGET_PROPS };
export const FAN_KEYS = Object.keys(FAN_PROPS);

// subtypes
export const FAN_SUBTYPE_PROPS = {
  [FAN]: [TARGET1, TARGET2, TARGET3, TARGET4], // Default value.
};
