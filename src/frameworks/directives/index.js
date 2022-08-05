import { ObserveVisibility } from 'vue-observe-visibility'; // https://github.com/Akryum/vue-observe-visibility

import pageTitleDirective from './pageTitle';
import pageVisibilityDirective from './pageVisibility';
import resizeDirective from './resize';
import responsiveDirective from './responsive';

export default (vueApp) => {
  // Make the element visibility directive global. Use with v-visibility.
  vueApp.directive('visibility', ObserveVisibility);

  // Use this as a directive in your template with: v-page-title.
  vueApp.directive('page-title', pageTitleDirective);

  // Make the page visibility directive global. Use with v-page-visibility.
  vueApp.directive('page-visibility', pageVisibilityDirective);

  // Make the resize directive global. Use with v-resize.
  vueApp.directive('resize', resizeDirective);

  // Make the responsive directive global. Use with v-responsive.
  vueApp.directive('responsive', responsiveDirective);
};
