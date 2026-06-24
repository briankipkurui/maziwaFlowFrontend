import { createRouter, createWebHistory } from 'vue-router';

import NotFoundView from '@/views/NotFoundView.vue';
import HomeView from '@/features/home/HomeView.vue';
import LoginView from '@/features/auth/views/LoginView.vue';
import SystemAdminLayout from '@/features/auth/layouts/SystemAdminLayout.vue';
import CooperativeAdminLayout from '@/features/auth/layouts/CooperativeAdminLayout.vue';
import CooperativeVetLayout from '@/features/auth/layouts/CooperativeVetLayout.vue';

import CooperativeUnionsViews from '@/features/cooperativeUnion/views/cooperativeUnionsViews.vue';
import CooperativesView from '@/features/cooperatives/views/cooperativesView.vue';
import cooperativesMemberView from '@/features/cooperativeMembers/views/cooperativesMemberView.vue';

import { useAuthFeatureStore } from '@/features/auth/stores/authStore';
import { initializeAuth } from '@/utils/initAuth';

import CooperativeMemberPermissionsView from '@/features/cooperativesMemberRoles/view/CooperativeMemberPermissionsView.vue';
import CooperativeMemberRoleView from '@/features/cooperativesMemberRoles/view/CooperativeMemberRoleView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
      meta: { title: 'Home' },
    },

    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { title: 'Login', public: true },
    },

    {
      path: '/admin',
      component: SystemAdminLayout,
      meta: {
        title: 'System Admin',
        requiresAuth: true,
      },
      children: [
        {
          path: 'cooperative-unions',
          name: 'cooperativeUnionsViews',
          component: CooperativeUnionsViews,
          meta: {
            title: 'Cooperative Unions',
            requiresAuth: true,
          },
        },
        {
          path: 'cooperatives',
          name: 'cooperativesViews',
          component: CooperativesView,
          meta: {
            title: 'Cooperatives',
            requiresAuth: true,
          },
        },
        {
          path: 'cooperativemembers',
          name: 'cooperativemembersViews',
          component: cooperativesMemberView,
          meta: {
            title: 'Cooperative Members',
            requiresAuth: true,
          },
        },
        {
          path: 'cooperativememberspermissions',
          name: 'CooperativeMemberPermissionsView',
          component: CooperativeMemberPermissionsView,
          meta: {
            title: 'Cooperative Member Permissions',
            requiresAuth: true,
          },
        },
        {
          path: 'cooperativemembersroles',
          name: 'CooperativeMemberRoleView',
          component: CooperativeMemberRoleView,
          meta: {
            title: 'Cooperative Member Roles',
            requiresAuth: true,
          },
        },
      ],
    },

    {
      path: '/cooperative-admin',
      component: CooperativeAdminLayout,
      meta: {
        title: 'Cooperative Admin',
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          redirect: '/cooperative-admin',
        },
      ],
    },

    {
      path: '/cooperative-vet',
      component: CooperativeVetLayout,
      meta: {
        title: 'Cooperative Vet',
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          redirect: '/cooperative-vet',
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
      meta: { title: 'Not Found', public: true },
    },
  ],
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthFeatureStore();

  if (to.meta.title) {
    document.title = `${String(to.meta.title)} | Maziwa Flow`;
  }

  const isLoginRoute = to.path === '/login';
  const isHomeRoute = to.path === '/';

  const isLogoutRedirect = isLoginRoute && to.query.logout === '1';

  const getSafeRedirect = (redirect: unknown): string | null => {
    if (typeof redirect !== 'string') {
      return null;
    }

    if (!redirect.startsWith('/') || redirect.startsWith('//')) {
      return null;
    }

    if (redirect === '/login' || redirect === '/') {
      return null;
    }

    return redirect;
  };

  const getDefaultRoute = (): string => {
    const roleName = authStore.user?.role?.name?.trim().toLowerCase();

    if (
      roleName === 'admin' ||
      roleName === 'super admin' ||
      roleName === 'super_admin' ||
      roleName === 'default admin'
    ) {
      return '/admin';
    }

    if (roleName === 'cooperative admin' || roleName === 'cooperative_admin') {
      return '/cooperative-admin';
    }

    if (roleName === 'cooperative vet' || roleName === 'cooperative_vet') {
      return '/cooperative-vet';
    }

    return '/';
  };

  const getPreviousRoute = (): string | null => {
    if (from.fullPath && from.fullPath !== '/' && from.fullPath !== '/login') {
      return from.fullPath;
    }

    const savedRoute = sessionStorage.getItem('lastAuthenticatedRoute');

    if (savedRoute && savedRoute !== '/' && savedRoute !== '/login') {
      return savedRoute;
    }

    return null;
  };

  /**
   * When logout sends the user to /login?logout=1,
   * do not call initializeAuth().
   */
  if (isLogoutRedirect) {
    sessionStorage.removeItem('lastAuthenticatedRoute');

    return true;
  }

  /**
   * If logout is in progress, never refresh the token.
   */
  if (authStore.isLoggingOut) {
    if (isLoginRoute) {
      return true;
    }

    return {
      path: '/login',
      query: {
        logout: '1',
      },
    };
  }

  /**
   * If a logged-in user visits /login or /,
   * send them back to where they were.
   */
  if (isLoginRoute || isHomeRoute) {
    if (authStore.isAuthenticated) {
      const redirect = getSafeRedirect(to.query.redirect);

      return redirect ?? getPreviousRoute() ?? getDefaultRoute();
    }

    const isRefreshed = await initializeAuth();

    if (isRefreshed) {
      const redirect = getSafeRedirect(to.query.redirect);

      return redirect ?? getPreviousRoute() ?? getDefaultRoute();
    }

    return true;
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (!requiresAuth) {
    return true;
  }

  if (authStore.isAuthenticated) {
    sessionStorage.setItem('lastAuthenticatedRoute', to.fullPath);

    return true;
  }

  const isRefreshed = await initializeAuth();

  if (isRefreshed) {
    sessionStorage.setItem('lastAuthenticatedRoute', to.fullPath);

    return true;
  }

  return {
    path: '/login',
    query: {
      redirect: to.fullPath,
    },
  };
});

export default router;