<script setup lang="ts">
import AdminLayout from '@/layouts/admin/AdminLayout.vue';

const sidebarItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },

  {
    label: 'Cooperative Unions',
    path: '/admin/cooperative-unions',
    icon: '🏢',
    children: [
      { label: 'view', path: '/admin/cooperative-unions' },
    ],
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: '👥',
    children: [
      { label: 'All Users', path: '/admin/users' },
      { label: 'Create User', path: '/admin/users/create' },
      { label: 'Users & Roles', path: '/admin/users/roles' },
      { label: 'Permissions', path: '/admin/users/permissions' },
    ],
  },

  {
    label: 'Reports',
    path: '/admin/reports',
    icon: '📄',
    children: [
      { label: 'Milk Reports', path: '/admin/reports/milk' },
      { label: 'Farmer Reports', path: '/admin/reports/farmers' },
      { label: 'Payment Reports', path: '/admin/reports/payments' },
    ],
  },

  {
    label: 'Settings',
    path: '/admin/settings',
    icon: '⚙️',
    children: [
      { label: 'General Settings', path: '/admin/settings' },
      { label: 'System Settings', path: '/admin/settings/system' },
    ],
  },
];

const userMenuItems = [
  { label: 'Home', path: '/admin' },
  { label: 'My Profile', path: '/admin/profile' },
  { label: 'Users & Roles', path: '/admin/users/roles' },
  { label: 'Sign Out', danger: true },
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
