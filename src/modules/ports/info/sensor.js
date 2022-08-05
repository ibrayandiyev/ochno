// Type
export const SENSOR = 'sensor';

// Paths/properties/capabilities
export const LUMINOSITY = 'luminosity';
export const LIGHT_CLEAR = 'lightclear';
export const LIGHT_TEMPERATURE = 'lighttemperature';
export const MOTION = 'motion';
export const TEMPERATURE = 'temperature';
export const AIR_HUMIDITY = 'airhumidity';
// export const AIR_PRESSURE = 'airpressure';
export const AIR_CO2 = 'airco2';
export const AIR_TVOC = 'airtvoc';

export const SENSOR_PROPS = {
  [MOTION]: { type: Boolean },
  [TEMPERATURE]: { type: Number },
  [LUMINOSITY]: { type: Number },
  [LIGHT_CLEAR]: { type: Number },
  [LIGHT_TEMPERATURE]: { type: Number },
  [AIR_HUMIDITY]: { type: Number },
  // [AIR_PRESSURE]: { type: Number },
  [AIR_CO2]: { type: Number },
  [AIR_TVOC]: { type: Number },
};
export const SENSOR_KEYS = Object.keys(SENSOR_PROPS);

// Subtypes
export const SENSOR_SUBTYPE_PROPS = {
  [SENSOR]: [LUMINOSITY, LIGHT_CLEAR, LIGHT_TEMPERATURE, MOTION, TEMPERATURE, AIR_HUMIDITY, /* AIR_PRESSURE, */ AIR_CO2, AIR_TVOC], // Default value.
};
export const SENSOR_SUBTYPES = Object.keys(SENSOR_SUBTYPE_PROPS);
