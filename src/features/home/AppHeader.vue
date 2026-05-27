<script setup lang="ts"></script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm"
        >
          MF
        </div>

        <div>
          <h1 class="text-lg font-bold leading-none text-slate-900">MaziwaFlow</h1>
          <p class="text-xs text-slate-500">Dairy Cooperative ERP</p>
        </div>
      </RouterLink>

      <!-- Desktop Links -->
      <div class="hidden items-center gap-8 md:flex">
        <RouterLink to="/" class="text-sm font-medium text-slate-600 hover:text-emerald-600">
          Home
        </RouterLink>

        <a href="#features" class="text-sm font-medium text-slate-600 hover:text-emerald-600">
          Features
        </a>

        <a href="#solutions" class="text-sm font-medium text-slate-600 hover:text-emerald-600">
          Solutions
        </a>

        <a href="#contact" class="text-sm font-medium text-slate-600 hover:text-emerald-600">
          Contact
        </a>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <RouterLink
          to="/login"
          class="rounded-xl border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          Login
        </RouterLink>

        <RouterLink
          to="/register"
          class="hidden rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:inline-flex"
        >
          Get Started
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
