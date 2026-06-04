<script setup lang="ts">
import AdminLayout from '@/layouts/admin/AdminLayout.vue';

const sidebarItems = [
  { label: 'Dashboard', path: '/cooperative-vet', icon: '📊' },
  { label: 'Farmers', path: '/cooperative-vet/farmers', icon: '👨‍🌾' },
  { label: 'Vet Visits', path: '/cooperative-vet/visits', icon: '🩺' },
  { label: 'Cattle Records', path: '/cooperative-vet/cattle', icon: '🐄' },
  { label: 'Health Reports', path: '/cooperative-vet/reports', icon: '📋' },
];
</script>

<template>
  <AdminLayout
    title="Cooperative Vet"
    subtitle="Animal Health Services"
    :sidebar-items="sidebarItems"
  >
    <RouterView />
  </AdminLayout>
</template>
