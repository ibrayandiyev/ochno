import _ from 'lodash';

const events = ['mousemove', 'touchmove', 'touchstart', 'touchend'];

// Trigger an event when the user has been idle.
export default function idleEvent(timeout, onEvent) {
  const bounce = _.debounce(() => {
    // Debounce was reached = User was idle.
    events.forEach((eventName) => document.removeEventListener(eventName, bounce));
    onEvent();
  }, timeout);

  // Setup events to listen to.
  events.forEach((eventName) => document.addEventListener(eventName, bounce));

  // Need to call debounce function this once to start the debounce.
  bounce();

  // Return cancel function.
  return () => {
    bounce.cancel();
    events.forEach((eventName) => document.removeEventListener(eventName, bounce));
  };
}
