import ControlButtons from './buttons/ControlButtons.vue';
import ControlDimmers from './dimmers/ControlDimmers.vue';
import ControlFans from './fans/ControlFans.vue';
import ControlLamps from './lamps/ControlLamps.vue';
// import ControlMechanisms from './mechanisms/ControlMechanisms.vue';
import ControlSensors from './sensors/ControlSensors.vue';

export const componentMap = {
  ControlLamps,
  ControlFans,
  ControlButtons,
  ControlDimmers,
  ControlSensors,
  // ControlMechanisms,
};

// NOTE: Order may be important
export const deviceMap = {
  lamp: { component: ControlLamps },
  fan: { component: ControlFans },
  button: { component: ControlButtons },
  sensor: { component: ControlSensors },
  dimmer: { component: ControlDimmers },
};
