import { createApp } from 'vue';

import Ochno from './ui/views/Ochno.vue';
import initialize from './frameworks';
import './ui/style/index.less';

(async () => {
  const app = createApp(Ochno);
  await initialize(app);
  app.mount('#app');
})();
