import _ from 'lodash';

import accountsStore from '../accounts/store';
import hubsStore from '../hubs/store';
import mechanismsStore from '../mechanisms/store';
import spacesStore from '../spaces/store';

export default function canAbility(ability, action, type, item) {
  if (type === 'ControlSchemes') {
    return canAbility('Accounts', accountsStore.state.accounts[item.accountId])
      || canAbility('Spaces', spacesStore.state.spaces[item.spaceId]);
  }
  if (type === 'MechanismControls') {
    const mechanisms = _.pick(mechanismsStore.state.mechanisms, item.mechanismIds);
    const spaces = mechanisms.map(({ spaceId }) => spacesStore.state.spaces[spaceId]);
    const accountIds = spaces.map(({ accountId }) => accountId);
    return canAbility('Spaces', { accountId: { $all: accountIds } });
  }
  if (type === 'Mechanisms') {
    return canAbility('Spaces', spacesStore.state.spaces[item.spaceId]);
  }
  if (type === 'Ports') {
    return canAbility('Hubs', hubsStore.state.hubs[item.hubId]);
  }

  // TODO: This casl hack doesn't seem right, is there any other way to make this function work with the correct type of item data.
  //       In other words: How do we replace __caslSubjectType__ with something else?
  return ability.can(action, { ...item, __caslSubjectType__: type });
}
