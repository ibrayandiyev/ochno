import i18next from 'i18next';
import _ from 'lodash';

import { BUTTON, PUSHED, ACTIVE_PORT, BUTTON_PROPS, BUTTON_SUBTYPE_PROPS } from '../../modules/ports/info/button';
import { FAN, TARGET, TARGET1, TARGET2, TARGET3, TARGET4, TARGET_KEYS, TARGET_PROPS, FAN_SUBTYPE_PROPS } from '../../modules/ports/info/fan';
import { LAMP, LEVEL, TEMP, RED, GREEN, BLUE, ALT_LEVEL, ALT_TEMP, ALT_RED, ALT_GREEN, ALT_BLUE, LAMP_PROPS, LAMP_SUBTYPE_PROPS } from '../../modules/ports/info/lamp';

export const subtypeProperties = {
  [BUTTON]: BUTTON_SUBTYPE_PROPS,
  [FAN]: FAN_SUBTYPE_PROPS,
  [LAMP]: LAMP_SUBTYPE_PROPS,
};

export const settings = {
  /* eslint-disable key-spacing, no-multi-spaces */
  [FAN]: {
    [TARGET]:  { ...TARGET_PROPS[TARGET1], prop: TARGET, props: TARGET_KEYS, icon: 'fan', label: i18next.t(`${FAN}.${TARGET}`) },
    [TARGET1]: { ...TARGET_PROPS[TARGET1], prop: TARGET1,                    icon: 'fan', label: i18next.t(`${FAN}.${TARGET1}`) },
    [TARGET2]: { ...TARGET_PROPS[TARGET2], prop: TARGET2,                    icon: 'fan', label: i18next.t(`${FAN}.${TARGET2}`) },
    [TARGET3]: { ...TARGET_PROPS[TARGET3], prop: TARGET3,                    icon: 'fan', label: i18next.t(`${FAN}.${TARGET3}`) },
    [TARGET4]: { ...TARGET_PROPS[TARGET4], prop: TARGET4,                    icon: 'fan', label: i18next.t(`${FAN}.${TARGET4}`) },
  },
  [LAMP]: {
    [LEVEL]: { ...LAMP_PROPS[LEVEL], prop: LEVEL, icon: 'light', label: i18next.t(`${LAMP}.${LEVEL}`) },
    [TEMP]:  { ...LAMP_PROPS[TEMP],  prop: TEMP,  icon: 'temp',  label: i18next.t(`${LAMP}.${TEMP}`), slider: 'temp-slider' },
    [RED]:   { ...LAMP_PROPS[RED],   prop: RED,   icon: 'temp',  label: i18next.t(`${LAMP}.${RED}`) },
    [GREEN]: { ...LAMP_PROPS[GREEN], prop: GREEN, icon: 'temp',  label: i18next.t(`${LAMP}.${GREEN}`) },
    [BLUE]:  { ...LAMP_PROPS[BLUE],  prop: BLUE,  icon: 'temp',  label: i18next.t(`${LAMP}.${BLUE}`) },

    [ALT_LEVEL]: { ...LAMP_PROPS[ALT_LEVEL], prop: ALT_LEVEL, icon: 'light', label: i18next.t(`${LAMP}.${LEVEL}`) },
    [ALT_TEMP]:  { ...LAMP_PROPS[ALT_TEMP],  prop: ALT_TEMP,  icon: 'temp',  label: i18next.t(`${LAMP}.${TEMP}`), slider: 'temp-slider' },
    [ALT_RED]:   { ...LAMP_PROPS[ALT_RED],   prop: ALT_RED,   icon: 'temp',  label: i18next.t(`${LAMP}.${RED}`) },
    [ALT_GREEN]: { ...LAMP_PROPS[ALT_GREEN], prop: ALT_GREEN, icon: 'temp',  label: i18next.t(`${LAMP}.${GREEN}`) },
    [ALT_BLUE]:  { ...LAMP_PROPS[ALT_BLUE],  prop: ALT_BLUE,  icon: 'temp',  label: i18next.t(`${LAMP}.${BLUE}`) },
  },
  [BUTTON]: {
    [PUSHED]:      { ...BUTTON_PROPS[PUSHED],      prop: PUSHED,      icon: 'button',     label: i18next.t(`${BUTTON}.${PUSHED}`) },
    [ACTIVE_PORT]: { ...BUTTON_PROPS[ACTIVE_PORT], prop: ACTIVE_PORT, icon: 'portswitch', label: i18next.t(`${BUTTON}.${ACTIVE_PORT}`) },
  },
  /* eslint-enable key-spacing, no-multi-spaces */
};

export const groups = {
  [FAN]: [
    { label: i18next.t('All fans'), sets: [TARGET] },
    { label: i18next.t('Individual fans'), sets: TARGET_KEYS },
  ],
  [LAMP]: [
    { label: i18next.t('Primary light'), sets: [LEVEL, TEMP, RED, GREEN, BLUE] },
    { label: i18next.t('Secondary light'), sets: [ALT_LEVEL, ALT_TEMP, ALT_RED, ALT_GREEN, ALT_BLUE] },
  ],
};

export function typeProperties(types = [], subtypes = []) {
  return types.reduce((obj, type) => ({
    ...obj,
    [type]: _.chain(subtypes)
      .unshift(type)
      .map((sub) => _.get(subtypeProperties, `${type}.${sub}`, []))
      .flatten()
      .uniq()
      .compact()
      .value(),
  }), {});
}

export function propertySettings(propMap = {}) {
  return Object.entries(propMap).reduce((obj, [type, properties]) => ({
    ...obj,
    [type]: _.chain(properties)
      .map((prop) => _.get(settings, `${type}.${prop}`))
      .compact()
      .value(),
  }), {});
}

export function propertyGroupedSettings(propMap = {}) {
  return Object.entries(propMap).reduce((obj, [type, properties]) => ({
    ...obj,
    [type]: _.chain(groups[type])
      .map(({ label, sets }) => {
        const filtered = _.intersection(sets, properties);
        return filtered.length && { label, settings: propertySettings({ [type]: filtered })[type] };
      })
      .compact() // This also removes values of 0.
      .value(),
  }), {});
}
