export default function focusNext(ev) {
  const nodes = ev?.target?.parentElement?.parentElement?.querySelectorAll('input');
  if (nodes) {
    const arr = Array.from(nodes);
    const index = arr.indexOf(ev.target);
    if (arr[index + 1]) {
      arr[index + 1].focus();
    }
  }
}
