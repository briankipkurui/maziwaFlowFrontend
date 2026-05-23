<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="w-full h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center px-6">
      <h1 class="text-9xl font-bold text-gray-800">404</h1>
      <h2 class="text-2xl font-medium text-gray-700 mt-4">Page Not Found</h2>
      <p class="text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <RouterLink
        to="/"
        class="inline-block mt-8 px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition duration-200"
      >
        Go to Home
      </RouterLink>
    </div>
  </main>
</template>
