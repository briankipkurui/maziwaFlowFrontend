<script setup lang="ts">
import { computed, ref } from 'vue';

import Column from 'primevue/column';
import { LoaderCircle } from 'lucide-vue-next';

import EntityTable from '@/components/shared/EntityTable.vue';

import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative';

import { useCooperativeMemberRolePermissionsQuery } from '../composables/queries/cooperativeMemberRoleQueries';
import type { CooperativeMemberPermission } from '../types/cooperativeMemberRoleTypes';

const searchInput = ref('');
const appliedSearch = ref('');
const page = ref(1);
const pageSize = ref(10);

const { activeCooperativeId, activeCooperative } = useActiveCooperative();

const { data, isLoading, isError, error, refetch } = useCooperativeMemberRolePermissionsQuery();

const cooperativeName = computed(
  () => activeCooperative.value?.cooperative.groupName ?? 'the logged-in cooperative',
);

const tableDescription = computed(
  () => `View permissions available for cooperative member roles under ${cooperativeName.value}.`,
);

const filteredPermissions = computed(() => {
  const permissions = data.value ?? [];
  const search = appliedSearch.value.trim().toLowerCase();

  if (!search) {
    return permissions;
  }

  return permissions.filter((permission) => {
    return (
      permission.name.toLowerCase().includes(search) ||
      permission.description?.toLowerCase().includes(search)
    );
  });
});

const totalItems = computed(() => filteredPermissions.value.length);

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalItems.value / pageSize.value));
});

const currentPage = computed(() => page.value);

const hasPreviousPage = computed(() => page.value > 1);

const hasNextPage = computed(() => page.value < totalPages.value);

const permissions = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return filteredPermissions.value.slice(start, end);
});

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  return 'Failed to load cooperative member permissions.';
});

const formatDate = (date?: string): string => {
  if (!date) {
    return 'Not provided';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not provided';
  }

  return parsedDate.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatPermissionName = (name: string): string => {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const handleSearch = () => {
  page.value = 1;
  appliedSearch.value = searchInput.value.trim();
};

const clearSearch = () => {
  searchInput.value = '';
  appliedSearch.value = '';
  page.value = 1;
};

const nextPage = () => {
  if (!hasNextPage.value) {
    return;
  }

  page.value += 1;
};

const previousPage = () => {
  if (!hasPreviousPage.value) {
    return;
  }

  page.value -= 1;
};
</script>

<template>
  <section v-if="!activeCooperativeId" class="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
    <div class="mb-6">
      <h1 class="text-[26px] font-bold tracking-[-0.02em] text-heading">
        Cooperative Member Permissions
      </h1>

      <p class="mt-1.5 text-sm font-normal text-secondary-text">
        View permissions available for cooperative member roles.
      </p>
    </div>

    <div
      class="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary"
    >
      No cooperative is linked to your logged-in account. Please log in again or contact the system
      administrator.
    </div>
  </section>

  <EntityTable
    v-else
    v-model:search-value="searchInput"
    title="Cooperative Member Permissions"
    :description="tableDescription"
    search-placeholder="Search permissions"
    create-label=""
    item-label="permission(s)"
    :rows="permissions"
    :total-items="totalItems"
    :current-page="currentPage"
    :total-pages="totalPages"
    :has-previous-page="hasPreviousPage"
    :has-next-page="hasNextPage"
    :is-loading="isLoading"
    :is-error="isError"
    :error-message="errorMessage"
    data-key="id"
    wide
    @search="handleSearch"
    @clear="clearSearch"
    @refresh="() => refetch()"
    @previous="previousPage"
    @next="nextPage"
  >
    <template #columns>
      <Column header="Permission" style="width: 30%">
        <template #body="{ data: permission }: { data: CooperativeMemberPermission }">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-heading">
              {{ formatPermissionName(permission.name) }}
            </p>

            <p class="mt-0.5 truncate text-xs font-medium text-muted-text">
              {{ permission.name }}
            </p>
          </div>
        </template>
      </Column>

      <Column header="Description" style="width: 40%">
        <template #body="{ data: permission }: { data: CooperativeMemberPermission }">
          <span class="text-sm font-medium text-secondary-text">
            {{ permission.description || 'No description provided' }}
          </span>
        </template>
      </Column>

      <Column header="Created">
        <template #body="{ data: permission }: { data: CooperativeMemberPermission }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(permission.createdAt) }}
          </span>
        </template>
      </Column>

      <Column header="Updated">
        <template #body="{ data: permission }: { data: CooperativeMemberPermission }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(permission.updatedAt) }}
          </span>
        </template>
      </Column>

      <Column header="Status" style="width: 150px">
        <template #body>
          <span
            class="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-success/20"
          >
            Active
          </span>
        </template>
      </Column>
    </template>

    <template #empty> No cooperative member permissions found. </template>

    <template #loading>
      <div
        class="flex items-center justify-center gap-2 py-8 text-sm font-medium text-secondary-text"
      >
        <LoaderCircle class="h-4 w-4 animate-spin" />
        Loading permissions...
      </div>
    </template>
  </EntityTable>
</template>
