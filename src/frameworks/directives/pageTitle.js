import i18next from 'i18next';

function directiveTitle(el, { value }) {
  document.title = value ? `${value} | ${i18next.t('Ochno Operated')}` : i18next.t('Ochno Operated');
}

export default {
  mounted: directiveTitle,
  updated: directiveTitle,
};
