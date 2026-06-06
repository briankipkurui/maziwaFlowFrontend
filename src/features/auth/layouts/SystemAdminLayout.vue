<script setup lang="ts">
import AdminLayout from '@/layouts/admin/AdminLayout.vue';

import {
  Building2,
  FileText,
  LayoutDashboard,
  Network,
  Settings,
  Users,
  UsersRound,
} from 'lucide-vue-next';

const sidebarItems = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },

  {
    label: 'Cooperative Unions',
    path: '/admin/cooperative-unions',
    icon: Network,
    children: [
      {
        label: 'Cooperative Unions',
        path: '/admin/cooperative-unions',
      },
    ],
  },

  {
    label: 'Cooperatives',
    path: '/admin/cooperatives',
    icon: Building2,
    children: [
      {
        label: 'Cooperatives',
        path: '/admin/cooperatives',
      },
    ],
  },

  {
    label: 'Cooperative Members',
    path: '/admin/cooperativemembers',
    icon: UsersRound,
    children: [
      {
        label: 'Cooperative Members',
        path: '/admin/cooperativemembers',
      },
    ],
  },

  {
    label: 'Users',
    path: '/admin/users',
    icon: Users,
    children: [
      {
        label: 'All Users',
        path: '/admin/users',
      },
      {
        label: 'Create User',
        path: '/admin/users/create',
      },
      {
        label: 'Users & Roles',
        path: '/admin/users/roles',
      },
      {
        label: 'Permissions',
        path: '/admin/users/permissions',
      },
    ],
  },

  {
    label: 'Reports',
    path: '/admin/reports',
    icon: FileText,
    children: [
      {
        label: 'Milk Reports',
        path: '/admin/reports/milk',
      },
      {
        label: 'Farmer Reports',
        path: '/admin/reports/farmers',
      },
      {
        label: 'Payment Reports',
        path: '/admin/reports/payments',
      },
    ],
  },

  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    children: [
      {
        label: 'General Settings',
        path: '/admin/settings',
      },
      {
        label: 'System Settings',
        path: '/admin/settings/system',
      },
    ],
  },
];

const userMenuItems = [
  {
    label: 'Home',
    path: '/admin',
  },
  {
    label: 'My Profile',
    path: '/admin/profile',
  },
  {
    label: 'Users & Roles',
    path: '/admin/users/roles',
  },
  {
    label: 'Sign Out',
    danger: true,
  },
];

const logout = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};
</script>

<template>
  <AdminLayout
    title="System Admin"
    subtitle="Platform Management"
    user-email="admin@email.com"
    user-initials="BM"
    :sidebar-items="sidebarItems"
    :user-menu-items="userMenuItems"
    @logout="logout"
  >
    <RouterView />
  </AdminLayout>
</template>
