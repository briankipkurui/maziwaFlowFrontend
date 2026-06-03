import { createRouter, createWebHistory } from 'vue-router';

import NotFoundView from '@/views/NotFoundView.vue';
import HomeView from '@/features/home/HomeView.vue';
import LoginView from '@/features/auth/views/LoginView.vue';
import CooperativesView from '@/features/auth/views/CooperativesView.vue';
import SystemAdminLayout from '@/features/auth/layouts/SystemAdminLayout.vue';
import CooperativeAdminLayout from '@/features/auth/layouts/CooperativeAdminLayout.vue';
import CooperativeVetLayout from '@/features/auth/layouts/CooperativeVetLayout.vue';
import usersViews from '@/features/users/views/usersViews.vue';

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
      meta: { title: 'Login' },
    },

    {
      path: '/cooperatives',
      name: 'Cooperatives',
      component: CooperativesView,
      meta: { title: 'Cooperatives' },
    },

    {
      path: '/cooperative/:id',
      name: 'Cooperative',
      component: () => import('@/features/cooperative/CooperativeView.vue'),
      props: true,
      meta: { title: 'Cooperative' },
    },

    {
      path: '/admin',
      component: SystemAdminLayout,
      meta: { title: 'System Admin' },
      children: [
        {
          path: 'users',
          name: 'usersViews',
          component: usersViews,
        },
      ],
    },

    {
      path: '/cooperative-admin',
      component: CooperativeAdminLayout,
      meta: { title: 'Cooperative Admin' },
      children: [
        // {
        //   path: '',
        //   name: 'CooperativeAdminDashboard',
        //   component: CooperativeAdminDashboard,
        // },
      ],
    },

    {
      path: '/cooperative-vet',
      component: CooperativeVetLayout,
      meta: { title: 'Cooperative Vet' },
      children: [
        // {
        //   path: '',
        //   name: 'CooperativeVetDashboard',
        //   component: CooperativeVetDashboard,
        // },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
});

export default router;
