<script setup lang="ts">
import BackLayout from '@/layouts/BackLayout.vue';
import { ref } from 'vue';

const username = ref('');
const password = ref('');

const handleLogin = () => {
  console.log({
    username: username.value,
    password: password.value,
  });
};
</script>

<template>
  <BackLayout>
    <div class="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
      <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white"
          >
            MF
          </div>

          <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p class="mt-2 text-sm text-slate-500">Login to continue to MaziwaFlow</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="Enter username"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Enter password"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            class="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  </BackLayout>
</template>
