import i18next from 'i18next'; // https://www.i18next.com/overview/api
import i18NextBrowserLanguageDetector from 'i18next-browser-languagedetector'; // https://github.com/i18next/i18next-browser-languageDetector
import i18NextHTTPBackend from 'i18next-http-backend'; // https://github.com/i18next/i18next-http-backend

const isLocal = window.location.hostname === 'localhost';

export default async (vueApp) => {
  await i18next
    .use(i18NextBrowserLanguageDetector)
    .use(i18NextHTTPBackend)
    .init({
      // https://www.i18next.com/configuration-options.html
      load: 'languageOnly',
      supportedLngs: ['en'],
      fallbackLng: 'en',
      defaultNS: 'app',
      ns: ['app'],
      keySeparator: false,
      nsSeparator: false,

      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json', // path where resources get loaded from
      },
      debug: isLocal,
    });

  // NOTE: i18next flips out when pushing an empty string, so lets not.
  vueApp.config.globalProperties.$t = (key, opts) => (key === '' ? '' : i18next.t(key, opts)); // eslint-disable-line no-param-reassign
};
