<script setup lang="ts">
// Auth layout - wraps authentication-related views
</script>

<template>
  <main class="w-full min-h-screen flex items-center justify-center bg-gray-50">
    <div
      class="max-w-md w-full px-8 py-12 bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col gap-5"
    >
      <slot />
    </div>
  </main>
</template>
