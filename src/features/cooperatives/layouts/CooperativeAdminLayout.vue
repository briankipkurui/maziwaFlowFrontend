<script setup lang="ts">
import AdminLayout from '@/layouts/admin/AdminLayout.vue';

const sidebarItems = [
  { label: 'Dashboard', path: '/cooperative-admin', icon: '📊' },
  { label: 'Members', path: '/cooperative-admin/members', icon: '👨‍🌾' },
  { label: 'Milk Collections', path: '/cooperative-admin/collections', icon: '🥛' },
  { label: 'Payments', path: '/cooperative-admin/payments', icon: '💰' },
  { label: 'Reports', path: '/cooperative-admin/reports', icon: '📄' },
];
</script>

<template>
  <AdminLayout
    title="Cooperative Admin"
    subtitle="Cooperative Operations"
    :sidebar-items="sidebarItems"
  >
    <RouterView />
  </AdminLayout>
</template>
