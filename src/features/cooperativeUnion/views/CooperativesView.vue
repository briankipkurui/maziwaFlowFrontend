<script setup lang="ts">
const cooperatives = [
  {
    id: 1,
    name: 'Kapsabet Dairy Cooperative',
    county: 'Nandi',
    members: 1240,
    collections: '18,450L',
    branches: 8,
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Eldoret Farmers Milk Society',
    county: 'Uasin Gishu',
    members: 860,
    collections: '11,200L',
    branches: 5,
    role: 'Manager',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Kericho Milk Producers SACCO',
    county: 'Kericho',
    members: 640,
    collections: '8,900L',
    branches: 3,
    role: 'Clerk',
    status: 'Pending',
  },
];
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <!-- Top Bar -->
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 font-bold text-white"
          >
            MF
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-900">MaziwaFlow</h1>
            <p class="text-xs text-slate-500">Cooperative Workspace</p>
          </div>
        </div>

        <RouterLink
          to="/login"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Logout
        </RouterLink>
      </div>
    </header>

    <!-- Content -->
    <section class="mx-auto max-w-7xl px-6 py-10">
      <div
        class="mb-8 rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-500 p-8 text-white shadow-sm"
      >
        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-100">
          My Cooperatives
        </p>

        <h2 class="mt-3 text-3xl font-extrabold">Select a cooperative to continue</h2>

        <p class="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
          Choose the cooperative society you want to manage. You will access milk collections,
          members, payments, reports, and operational records.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="cooperative in cooperatives"
          :key="cooperative.id"
          class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="p-6">
            <div class="mb-6 flex items-start justify-between gap-4">
              <div class="flex gap-4">
                <div
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700"
                >
                  MF
                </div>

                <div>
                  <h3 class="text-xl font-bold leading-snug text-slate-900">
                    {{ cooperative.name }}
                  </h3>
                  <p class="mt-1 text-sm text-slate-500">{{ cooperative.county }} County</p>
                </div>
              </div>

              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="
                  cooperative.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                "
              >
                {{ cooperative.status }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-xs text-slate-500">Members</p>
                <h4 class="mt-1 text-2xl font-bold text-slate-900">
                  {{ cooperative.members }}
                </h4>
              </div>

              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-xs text-slate-500">Today’s Milk</p>
                <h4 class="mt-1 text-2xl font-bold text-slate-900">
                  {{ cooperative.collections }}
                </h4>
              </div>

              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-xs text-slate-500">Branches</p>
                <h4 class="mt-1 text-2xl font-bold text-slate-900">
                  {{ cooperative.branches }}
                </h4>
              </div>

              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-xs text-slate-500">Your Role</p>
                <h4 class="mt-1 text-lg font-bold text-slate-900">
                  {{ cooperative.role }}
                </h4>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 bg-slate-50 p-5">
            <button
              type="button"
              class="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition group-hover:bg-emerald-700"
            >
              Open Cooperative
            </button>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
