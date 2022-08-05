// NOTE: Some comments in this file play a part in how the files are bundled for production.
import { createRouter, createWebHashHistory } from 'vue-router';

import authStore from '../modules/auth/store';

// Below components should be part of the initial build.
import SignIn from '../ui/views/auth/SignIn.vue';

export default (vueApp) => {
  const signinPath = '/signin';

  const router = createRouter({
    history: createWebHashHistory(),

    routes: [
      {
        path: signinPath,
        component: SignIn,
        meta: { noAuth: true },
      },

      {
        path: '/signout',
        component: () => import(/* webpackPrefetch: true */ '../ui/views/auth/SignOut.vue'),
        meta: { noAuth: true },
      },

      {
        path: '/reset/:token',
        component: () => import('../ui/views/auth/PasswordReset.vue'),
        meta: { noAuth: true },
      },

      {
        path: '/app',
        component: () => import(/* webpackPrefetch: true */ '../ui/views/dashboard/Dashboard.vue'),
      },
      {
        path: '/app/manage/:spaceId',
        component: () => import(/* webpackPrefetch: true */ '../ui/views/manage/Manage.vue'),
      },
      {
        path: '/app/controlpanel',
        component: () => import(/* webpackPrefetch: true */ '../ui/views/controlpanel/ControlPanel.vue'),
        meta: { noAuth: true },
      },

      {
        path: '/admin',
        component: () => import(/* webpackChunkName: "admin" */ '../ui/views/admin/Admin.vue'),
      },

      {
        path: '/theme',
        component: () => import(/* webpackChunkName: "theme" */ '../ui/views/theme/Theme.vue'),
        meta: { noAuth: true },
      },

      {
        path: '/usb',
        component: () => import(/* webpackChunkName: "usb" */ '../ui/views/usb/Usb.vue'),
      },

      {
        path: '/:pathMatch(.*)*',
        component: () => import('../ui/views/404.vue'),
      },
    ],
  });


  router.beforeEach((to, from, next) => {
    if (!to.path || to.path === '/') {
      return next('/app');
    }

    if (!to.meta.noAuth && !authStore.state.isLoggedIn) {
      const signinReroute = `${signinPath}?route=${encodeURIComponent(to.fullPath)}`;

      // Route requires authorization and user is not logged in.
      if (!authStore.state.initialized) {
        return authStore.dispatch.init()
          .then(() => next())
          .catch(() => next(signinReroute));
      }

      // User is not logged in.
      return next(signinReroute);
    }

    // Route does not require authorization, or, user is logged in already.
    return next();
  });

  vueApp.use(router);
};
