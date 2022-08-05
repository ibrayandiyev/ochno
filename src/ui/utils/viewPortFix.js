// Code to fix the viewport scrolling on mobile devices.
// https://css-tricks.com/the-trick-to-viewport-units-on-mobile/

export default function viewPortFix() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
