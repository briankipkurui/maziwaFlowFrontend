<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <main class="bg-slate-50">
    <div class="mx-auto w-full max-w-7xl px-6 py-6 lg:px-8">
      <button
        type="button"
        @click="goBack"
        class="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-emerald-700"
      >
        <span>←</span>
        Back
      </button>

      <slot />
    </div>
  </main>
</template>
