const substitutionRegex = /{(.*?)}/g;
const dataRegex = /{data\.(.*?)\.(.*?)}/g;
const stateRegex = /{state\.(.*?)}/g;

export default function pretty(substitution, { cleanState } = {}) {
  return substitution
    ? substitution.replaceAll(dataRegex, '$1 $2').replaceAll(stateRegex, cleanState ? '$1' : 'state $1').replaceAll(substitutionRegex, '$1')
    : '';
}
