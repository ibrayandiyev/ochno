import _ from 'lodash';

import Field from '../ui/components/Field.vue';
import Scrollbar from '../ui/components/Scrollbar.vue';
import Spinner from '../ui/components/Spinner.vue';
import Icon from '../ui/components/icons/Icon.vue';

export default (vueApp) => {
  // Make it possible to use lodash (_) in templates.
  vueApp.config.globalProperties.$_ = _; // eslint-disable-line no-param-reassign

  // Make the Icon component global.
  vueApp.component('Field', Field);
  vueApp.component('Icon', Icon);
  vueApp.component('Scrollbar', Scrollbar);
  vueApp.component('Spinner', Spinner);
};
