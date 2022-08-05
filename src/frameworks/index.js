import directives from './directives';
import elements from './elements';
// import casl from './casl';
import globals from './globals';
import i18next from './i18next';
import router from './router';

export default async (vueApp) => {
  globals(vueApp);
  directives(vueApp);
  await i18next(vueApp);
  elements(vueApp);
  // casl(vueApp);
  router(vueApp);
};
