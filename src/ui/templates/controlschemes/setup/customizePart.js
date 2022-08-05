import i18next from 'i18next';

const controlDecoration = {
  lamp: { name: i18next.t('Light controls'), icon: 'lamp', component: 'CustomizeLamp' },
  fan: { name: i18next.t('Fan controls'), icon: 'fan', component: 'CustomizeFan' },
  button: { name: i18next.t('Active port controls'), icon: 'button', component: 'CustomizeGeneral' },
  ControlMechanisms: { name: i18next.t('Automation controls'), icon: 'controls', component: 'CustomizeGeneral' },
  sensor: { name: i18next.t('Sensor visualization'), icon: 'sensor', component: 'CustomizeSensor' },
  CustomImage: { name: i18next.t('Custom image'), icon: 'photo', component: 'CustomizeImage' },
  CustomHTML: { name: i18next.t('Custom text'), icon: 'info', component: 'CustomizeHTML' },
};

export default (control) => (controlDecoration[control.deviceType || control.component]);
