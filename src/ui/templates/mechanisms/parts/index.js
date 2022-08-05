import i18next from 'i18next';

import Assert, * as ASSERT from './Assert.vue';
import DateTime, * as DATE_TIME from './DateTime.vue';
import OnPortData, * as ON_PORT_DATA from './OnPortData.vue';
import PID /* , * as P_I_D */ from './PID.vue';
import PortAction, * as PORT_ACTION from './PortAction.vue';
import SetState, * as SET_STATE from './SetState.vue';
import Wait, * as WAIT from './Wait.vue';

export const components = {
  assert: Assert,
  dateTime: DateTime,
  onPortData: OnPortData,
  pid: PID,
  portAction: PortAction,
  setState: SetState,
  wait: Wait,
};

export const partGroups = [
  {
    label: i18next.t('Parts'),
    parts: [
      { type: ON_PORT_DATA.TYPE, setup: ON_PORT_DATA.setup, label: i18next.t('Trigger on data') },
      { type: PORT_ACTION.TYPE, setup: PORT_ACTION.setup, label: i18next.t('Send action to port') },
      { type: SET_STATE.TYPE, setup: SET_STATE.setup, label: i18next.t('Set state') },
      { type: WAIT.TYPE, setup: WAIT.setup, label: i18next.t('Wait') },
    ],
  },
  {
    label: i18next.t('Filters'),
    parts: [
      { type: ASSERT.TYPE, setup: ASSERT.setup, label: i18next.t('If condition') },
      { type: DATE_TIME.TYPE, setup: DATE_TIME.setup, label: i18next.t('During day and time') },
    ],
  },
  {
    label: i18next.t('Structures'),
    parts: [
      { setup: () => [], label: i18next.t('Container'), addLast: true },
    ],
  },
];
