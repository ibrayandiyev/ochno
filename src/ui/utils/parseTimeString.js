const regexTime = /(-\d\d) /;

export default function parseTimeString(timeString) {
  return `${timeString.replace(regexTime, '$1T')}`;
}
