<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import AdminLayout from '@/layouts/admin/AdminLayout.vue';

import { Building2, Network, UsersRound } from 'lucide-vue-next';
import { useAuthFeatureStore } from '../stores/authStore';

const router = useRouter();

const authStore = useAuthFeatureStore();
const { user } = storeToRefs(authStore);

const sidebarItems = [
  {
    label: 'Cooperative Unions',
    path: '/admin/cooperative-unions',
    icon: Network,
    permissions: ['cooperative-union.read.union'],
  },

  {
    label: 'Cooperatives',
    path: '/admin/cooperatives',
    icon: Building2,
    permissions: ['cooperative-union.read.union', 'cooperative.read.cooperative'],
  },

  {
    label: 'Cooperative Members',
    path: '/admin/cooperativemembers',
    icon: UsersRound,
    permissions: ['cooperative-member.read.member', 'role.read.role'],
    children: [
      {
        label: 'Members',
        path: '/admin/cooperativemembers',
      },
      {
        label: 'Roles',
        path: '/admin/cooperativemembersroles',
      },
      {
        label: 'Permissions',
        path: '/admin/cooperativememberspermissions',
        permissions: ['cooperative'],
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

/**
 * Safely reads a text field from the logged-in user.
 * This prevents TypeScript errors if your API returns optional values.
 */
const getUserField = (field: string): string => {
  const currentUser = user.value as Record<string, unknown> | null;

  const value = currentUser?.[field];

  return typeof value === 'string' ? value.trim() : '';
};

const loggedInUserEmail = computed(() => {
  return getUserField('email') || 'user@email.com';
});

const loggedInUserName = computed(() => {
  const firstName = getUserField('firstName');
  const middleName = getUserField('middleName');
  const lastName = getUserField('lastName');

  const composedName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  return (
    composedName || getUserField('fullName') || getUserField('name') || loggedInUserEmail.value
  );
});

const loggedInUserInitials = computed(() => {
  const firstName = getUserField('firstName');
  const lastName = getUserField('lastName');

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase().slice(0, 2);
  }

  const nameParts = loggedInUserName.value
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  const firstPart = nameParts[0] ?? '';
  const lastPart = nameParts[nameParts.length - 1] ?? '';

  if (nameParts.length >= 2) {
    return `${firstPart.charAt(0)}${lastPart.charAt(0)}`.toUpperCase().slice(0, 2);
  }

  if (nameParts.length === 1) {
    return firstPart.slice(0, 2).toUpperCase();
  }

  return 'US';
});

const logout = async () => {
  authStore.clearAuth();

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  await router.replace('/login');
};
</script>

<template>
  <AdminLayout
    title="System Admin"
    subtitle="Platform Management"
    :user-name="loggedInUserName"
    :user-email="loggedInUserEmail"
    :user-initials="loggedInUserInitials"
    :sidebar-items="sidebarItems"
    :user-menu-items="userMenuItems"
    @logout="logout"
  >
    <RouterView />
  </AdminLayout>
</template>
