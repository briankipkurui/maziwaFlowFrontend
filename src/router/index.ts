import { createRouter, createWebHistory } from 'vue-router';

import NotFoundView from '@/views/NotFoundView.vue';
import HomeView from '@/features/home/HomeView.vue';
import LoginView from '@/features/auth/views/LoginView.vue';
import SystemAdminLayout from '@/features/auth/layouts/SystemAdminLayout.vue';
import CooperativeAdminLayout from '@/features/auth/layouts/CooperativeAdminLayout.vue';
import CooperativeVetLayout from '@/features/auth/layouts/CooperativeVetLayout.vue';
import usersViews from '@/features/users/views/usersViews.vue';
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
          path: '',
          redirect: '/admin/users',
        },
        {
          path: 'users',
          name: 'usersViews',
          component: usersViews,
          meta: {
            title: 'Users',
            requiresAuth: true,
          },
        },
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
            title: 'Cooperative Members',
            requiresAuth: true,
          },
        },
        {
          path: 'cooperativemembersroles',
          name: 'CooperativeMemberRoleView',
          component: CooperativeMemberRoleView,
          meta: {
            title: 'Cooperative Members',
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

router.beforeEach(async (to) => {
  const authStore = useAuthFeatureStore();

  if (to.meta.title) {
    document.title = `${String(to.meta.title)} | Maziwa Flow`;
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (!requiresAuth) {
    return true;
  }

  if (authStore.accessToken) {
    return true;
  }

  const isRefreshed = await initializeAuth();

  if (isRefreshed) {
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
