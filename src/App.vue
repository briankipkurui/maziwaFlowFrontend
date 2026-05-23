<script setup lang="ts">
import 'vue-sonner/style.css';
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
</script>

<template>
  <Toaster position="top-right" richColors theme="light" />
  <RouterView />
</template>
