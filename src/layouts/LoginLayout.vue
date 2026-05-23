<script setup lang="ts">
// Login layout - split-screen layout for login/auth pages
</script>

<template>
  <main class="w-full min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-screen-2xl h-screen max-h-[900px] flex">
      <!-- Left Panel - Add your branding/image here -->
      <div class="hidden lg:flex lg:w-1/2 bg-gray-800 items-center justify-center">
        <span class="text-white text-xl">Your Brand</span>
      </div>

      <!-- Form Panel -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white">
        <div
          class="max-w-md w-full px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-5 bg-white shadow-lg rounded-lg border border-gray-200"
        >
          <slot />
        </div>
      </div>
    </div>
  </main>
</template>
