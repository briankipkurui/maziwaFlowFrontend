<script setup lang="ts">
import AppHeader from './AppHeader.vue';

// Home view - MaziwaFlow ERP
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <AppHeader />
    <!-- Hero -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-green-500"
    >
      <div class="absolute inset-0 bg-black/10"></div>

      <div class="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div class="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p
              class="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur"
            >
              Cooperative Milk Collection ERP
            </p>

            <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Manage your dairy cooperative with confidence.
            </h1>

            <p class="mt-6 max-w-xl text-lg leading-8 text-emerald-50">
              MaziwaFlow helps cooperative societies manage members, milk collections, payments,
              routes, reports, and daily operations from one simple platform.
            </p>

            <div class="mt-8 flex flex-wrap gap-4">
              <RouterLink
                to="/login"
                class="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                Get Started
              </RouterLink>

              <RouterLink
                to="/dashboard"
                class="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Dashboard
              </RouterLink>
            </div>
          </div>

          <div class="rounded-3xl bg-white/95 p-6 shadow-2xl">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-800">Today’s Collection</h2>
                <p class="text-sm text-slate-500">Milk intake summary</p>
              </div>
              <span
                class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                Live
              </span>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl bg-emerald-50 p-5">
                <p class="text-sm text-slate-500">Total Litres</p>
                <h3 class="mt-2 text-3xl font-bold text-slate-900">12,480L</h3>
              </div>

              <div class="rounded-2xl bg-amber-50 p-5">
                <p class="text-sm text-slate-500">Active Farmers</p>
                <h3 class="mt-2 text-3xl font-bold text-slate-900">842</h3>
              </div>

              <div class="rounded-2xl bg-blue-50 p-5">
                <p class="text-sm text-slate-500">Routes Covered</p>
                <h3 class="mt-2 text-3xl font-bold text-slate-900">18</h3>
              </div>

              <div class="rounded-2xl bg-purple-50 p-5">
                <p class="text-sm text-slate-500">Payments Due</p>
                <h3 class="mt-2 text-3xl font-bold text-slate-900">KSh 1.8M</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div class="text-center">
        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          What MaziwaFlow manages
        </p>
        <h2 class="mt-3 text-3xl font-bold text-slate-900">
          One system for cooperative operations
        </h2>
      </div>

      <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-lg font-bold text-slate-900">Member Management</h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            Register farmers, manage profiles, cooperative membership, and member activity.
          </p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-lg font-bold text-slate-900">Milk Collections</h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            Track daily milk intake, collection centres, routes, quantity, and quality records.
          </p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-lg font-bold text-slate-900">Payments & Deductions</h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            Calculate farmer payments, deductions, advances, and monthly payout reports.
          </p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-lg font-bold text-slate-900">Cooperative Records</h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            Manage cooperatives, unions, branches, collection points, and internal users.
          </p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-lg font-bold text-slate-900">Reports & Analytics</h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            Generate collection summaries, member reports, route performance, and payment records.
          </p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-lg font-bold text-slate-900">User Access Control</h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            Give staff proper permissions based on their role in the cooperative.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
