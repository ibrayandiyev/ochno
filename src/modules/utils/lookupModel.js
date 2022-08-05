export function filterItemsByIds(items, idProperty, ids) {
  return Object.values(items).filter((item) => ids.indexOf(item[idProperty]) >= 0);
}

export function spacesOfAccounts(spaces, accountIds) {
  return filterItemsByIds(spaces, 'accountId', accountIds);
}

export function hubsOfAccounts(hubs, accountIds) {
  return filterItemsByIds(hubs, 'accountId', accountIds);
}
export function hubsOfSpaces(hubs, spaces, accountIds) {
  const spaceIds = spacesOfAccounts(spaces, accountIds);
  return filterItemsByIds(hubs, 'spaceId', spaceIds);
}

export function portsOfHubs(ports, hubIds) {
  return filterItemsByIds(ports, 'hubId', hubIds);
}
export function portsOfSpaces(ports, hubs, spaces, accountIds) {
  const hubIds = hubsOfSpaces(hubs, spaces, accountIds).map((item) => item.id);
  return portsOfHubs(ports, hubIds);
}
export function portsOfAccounts(ports, hubs, accountIds) {
  const hubIds = hubsOfAccounts(hubs, accountIds).map((item) => item.id);
  return portsOfHubs(ports, hubIds);
}

export function edgesOfAccounts(edges, accountIds) {
  return filterItemsByIds(edges, 'accountId', accountIds);
}

export function mechanismsOfSpaces(mechanisms, spaceIds) {
  return filterItemsByIds(mechanisms, 'spaceId', spaceIds);
}
export function mechanismsOfAccounts(mechanisms, spaces, accountIds) {
  const spaceIds = spacesOfAccounts(spaces, accountIds).map((item) => item.id);
  return mechanismsOfSpaces(mechanisms, spaceIds);
}

export function mechanismControlsOfSpaces(mechanismControls, spaceIds) {
  return filterItemsByIds(mechanismControls, 'spaceId', spaceIds);
}
export function mechanismControlsOfAccounts(mechanismControls, spaces, accountIds) {
  const spaceIds = spacesOfAccounts(spaces, accountIds).map((item) => item.id);
  return mechanismControlsOfSpaces(mechanismControls, spaceIds);
}

export function controlSchemesOfAccounts(controlSchemes, accountIds) {
  return filterItemsByIds(controlSchemes, 'accountId', accountIds);
}
