<script setup lang="ts">
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useUsers } from '../composables/useUsers';

const { users, isLoadingUsers, isErrorUsers, usersError, refreshUsers } = useUsers();

const search = ref('');
const activeTab = ref<'all' | 'active' | 'inactive'>('all');

const usersList = computed(() => users.value ?? []);

const filteredUsers = computed(() => {
  const keyword = search.value.toLowerCase().trim();

  return usersList.value.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

    const matchesSearch =
      !keyword ||
      fullName.includes(keyword) ||
      user.phoneNumber.toLowerCase().includes(keyword) ||
      user.id.toLowerCase().includes(keyword);

    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'active' && user.location && user.county) ||
      (activeTab.value === 'inactive' && (!user.location || !user.county));

    return matchesSearch && matchesTab;
  });
});

const handleAddUser = () => {
  console.log('Add user clicked');
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
</script>

<template>
  <section class="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 md:px-7 lg:px-8">
    <!-- Page Header -->
    <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Users</h1>
        <p class="mt-1 text-xs text-slate-500 sm:text-sm">
          Manage platform users and their access details.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative w-full sm:w-72 md:w-80">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"> 🔍 </span>

          <Input
            v-model="search"
            type="text"
            placeholder="Search Users"
            class="h-10 rounded-full border-slate-300 bg-white pl-9 text-xs shadow-sm focus-visible:ring-green-600 sm:text-sm"
          />
        </div>

        <Button
          type="button"
          class="h-10 rounded-md bg-green-700 px-5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-green-800 sm:text-xs"
          @click="handleAddUser"
        >
          Create User
        </Button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-2 flex items-center justify-between border-b border-slate-200">
      <div class="flex items-center gap-5 sm:gap-7">
        <button
          type="button"
          class="border-b-2 pb-3 text-xs font-semibold transition sm:text-sm"
          :class="
            activeTab === 'all'
              ? 'border-green-600 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          "
          @click="activeTab = 'all'"
        >
          All
        </button>

        <button
          type="button"
          class="border-b-2 pb-3 text-xs font-semibold transition sm:text-sm"
          :class="
            activeTab === 'active'
              ? 'border-green-600 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          "
          @click="activeTab = 'active'"
        >
          Active
        </button>

        <button
          type="button"
          class="border-b-2 pb-3 text-xs font-semibold transition sm:text-sm"
          :class="
            activeTab === 'inactive'
              ? 'border-green-600 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          "
          @click="activeTab = 'inactive'"
        >
          Inactive
        </button>
      </div>

      <button
        type="button"
        class="pb-3 text-base text-slate-500 transition hover:text-green-700 sm:text-lg"
        title="Refresh users"
        @click="refreshUsers"
      >
        ⟳
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoadingUsers"
      class="flex min-h-[250px] items-center justify-center bg-white text-xs text-slate-500 shadow-sm sm:text-sm"
    >
      Loading users...
    </div>

    <!-- Error -->
    <div
      v-else-if="isErrorUsers"
      class="rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700 sm:text-sm"
    >
      {{ usersError?.message || 'Failed to load users.' }}
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto bg-white shadow-sm">
      <Table class="min-w-[950px]">
        <TableHeader>
          <TableRow class="border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
            <TableHead
              class="w-[34%] px-4 py-4 text-[11px] font-semibold text-slate-400 sm:text-xs md:text-sm"
            >
              User Information
            </TableHead>

            <TableHead
              class="px-4 py-4 text-[11px] font-semibold text-slate-400 sm:text-xs md:text-sm"
            >
              Phone Number
            </TableHead>

            <TableHead
              class="px-4 py-4 text-[11px] font-semibold text-slate-400 sm:text-xs md:text-sm"
            >
              Location
            </TableHead>

            <TableHead
              class="px-4 py-4 text-[11px] font-semibold text-slate-400 sm:text-xs md:text-sm"
            >
              County
            </TableHead>

            <TableHead
              class="px-4 py-4 text-[11px] font-semibold text-slate-400 sm:text-xs md:text-sm"
            >
              Created At
            </TableHead>

            <TableHead
              class="px-4 py-4 text-right text-[11px] font-semibold text-slate-400 sm:text-xs md:text-sm"
            >
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="user in filteredUsers"
            :key="user.id"
            class="border-b border-slate-100 bg-white transition hover:bg-green-50/40"
          >
            <!-- User Information -->
            <TableCell class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-xs font-bold text-green-700 shadow-sm sm:h-10 sm:w-10"
                >
                  {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <span
                      class="h-2 w-2 rounded-full"
                      :class="user.location && user.county ? 'bg-green-500' : 'bg-slate-300'"
                    />

                    <span class="text-xs font-semibold text-slate-800 sm:text-sm md:text-base">
                      {{ user.firstName }} {{ user.lastName }}
                    </span>
                  </div>

                  <p class="mt-0.5 text-[11px] font-medium text-slate-400 sm:text-xs">
                    ID: {{ user.id }}
                  </p>

                  <p class="mt-1 text-[11px] font-bold text-slate-600 sm:text-xs">Detailed</p>
                </div>
              </div>
            </TableCell>

            <!-- Phone -->
            <TableCell class="px-4 py-4 text-xs font-medium text-slate-600 sm:text-sm md:text-base">
              {{ user.phoneNumber }}
            </TableCell>

            <!-- Location -->
            <TableCell class="px-4 py-4">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs"
                :class="
                  user.location
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                    : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                "
              >
                {{ user.location ? 'Available' : 'Not Set' }}
              </span>
            </TableCell>

            <!-- County -->
            <TableCell class="px-4 py-4">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs"
                :class="
                  user.county
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                    : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                "
              >
                {{ user.county ? 'Available' : 'Not Set' }}
              </span>
            </TableCell>

            <!-- Date -->
            <TableCell class="px-4 py-4 text-xs font-medium text-slate-600 sm:text-sm md:text-base">
              {{ formatDate(user.createdAt) }}
            </TableCell>

            <!-- Action -->
            <TableCell class="px-4 py-4 text-right">
              <button
                type="button"
                class="rounded-full px-3 py-1 text-xl font-bold leading-none text-slate-400 transition hover:bg-green-50 hover:text-green-700"
              >
                ⋮
              </button>
            </TableCell>
          </TableRow>

          <TableRow v-if="filteredUsers.length === 0">
            <TableCell :colspan="6" class="h-40 text-center text-xs text-slate-500 sm:text-sm">
              No users found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </section>
</template>
