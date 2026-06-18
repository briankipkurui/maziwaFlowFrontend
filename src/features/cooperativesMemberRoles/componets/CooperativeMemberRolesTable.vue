<script setup lang="ts">
import { computed, ref } from 'vue';

import { LoaderCircle, Pencil, Trash2, ShieldCheck } from 'lucide-vue-next';

import Column from 'primevue/column';

import EntityTable from '@/components/shared/EntityTable.vue';
import { Button } from '@/components/ui/button';


import { useCooperativeMemberRolesQuery } from '../composables/queries/cooperativeMemberRoleQueries.ts';

import {
  useCreateCooperativeMemberRoleMutation,
  useDeleteCooperativeMemberRoleMutation,
  useUpdateCooperativeMemberRoleMutation,
} from '../composables/mutations/cooperativeMemberRoleMutations.ts';


import type { CooperativeMemberPermission, CooperativeMemberRole, CooperativeMemberRolePayload } from '../types/cooperativeMemberRoleTypes.ts';
import CooperativeMemberRoleModal from './CooperativeMemberRoleModal.vue';

const searchInput = ref('');
const appliedSearch = ref('');
const page = ref(1);
const pageSize = ref(10);

const isModalOpen = ref(false);
const selectedRole = ref<CooperativeMemberRole | null>(null);
const deletingRoleId = ref<string | null>(null);

const queryParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: appliedSearch.value || undefined,
}));

const { data, isLoading, isError, error, refetch } = useCooperativeMemberRolesQuery(queryParams);

const createMutation = useCreateCooperativeMemberRoleMutation();
const updateMutation = useUpdateCooperativeMemberRoleMutation();
const deleteMutation = useDeleteCooperativeMemberRoleMutation();

const roles = computed(() => data.value?.results ?? []);
const totalItems = computed(() => data.value?.totalItems ?? 0);
const totalPages = computed(() => data.value?.totalPages ?? 1);
const currentPage = computed(() => data.value?.currentPage ?? page.value);
const hasNextPage = computed(() => data.value?.hasNextPage ?? false);
const hasPreviousPage = computed(() => data.value?.hasPreviousPage ?? false);

const isSubmitting = computed(
  () => createMutation.isPending.value || updateMutation.isPending.value,
);

const tableDescription = computed(
  () => 'Manage cooperative member roles and the permissions assigned to each role.',
);

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  return 'Failed to load cooperative member roles.';
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

const getPermissionCount = (role: CooperativeMemberRole): number => {
  return role.permissions?.length ?? 0;
};

const getPermissionPreview = (role: CooperativeMemberRole): string => {
  const permissions = role.permissions ?? [];

  if (!permissions.length) {
    return 'No permissions assigned';
  }

  const visiblePermissions = permissions
    .slice(0, 3)
    .map((permission:CooperativeMemberPermission) => formatPermissionName(permission.name));

  const remainingCount = permissions.length - visiblePermissions.length;

  if (remainingCount > 0) {
    return `${visiblePermissions.join(', ')} +${remainingCount} more`;
  }

  return visiblePermissions.join(', ');
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

const openCreateModal = () => {
  selectedRole.value = null;
  isModalOpen.value = true;
};

const openUpdateModal = (role: CooperativeMemberRole) => {
  selectedRole.value = role;
  isModalOpen.value = true;
};

const closeModal = () => {
  selectedRole.value = null;
  isModalOpen.value = false;
};

const handleSubmitRole = async (payload: CooperativeMemberRolePayload) => {
  if (selectedRole.value) {
    await updateMutation.mutateAsync({
      id: selectedRole.value.id,
      payload,
    });
  } else {
    await createMutation.mutateAsync(payload);
  }

  closeModal();
};

const handleDeleteRole = async (role: CooperativeMemberRole) => {
  const shouldDelete = window.confirm(`Are you sure you want to delete the role "${role.name}"?`);

  if (!shouldDelete) {
    return;
  }

  deletingRoleId.value = role.id;

  try {
    await deleteMutation.mutateAsync(role.id);
  } finally {
    deletingRoleId.value = null;
  }
};
</script>

<template>
  <EntityTable
    v-model:search-value="searchInput"
    title="Cooperative Member Roles"
    :description="tableDescription"
    search-placeholder="Search cooperative member roles"
    create-label="Create Role"
    item-label="role(s)"
    :rows="roles"
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
    @create="openCreateModal"
    @previous="previousPage"
    @next="nextPage"
  >
    <template #columns>
      <!-- Role Information -->
      <Column header="Role Information" style="width: 30%">
        <template #body="{ data: role }">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"
            >
              <ShieldCheck class="h-5 w-5" :stroke-width="2" />
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-heading">
                {{ role.name }}
              </p>

              <p class="mt-1 truncate text-xs text-secondary-text">
                {{ role.description || 'No description provided' }}
              </p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Permissions Count -->
      <Column header="Permissions">
        <template #body="{ data: role }">
          <span
            class="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20"
          >
            {{ getPermissionCount(role) }}
            {{ getPermissionCount(role) === 1 ? 'permission' : 'permissions' }}
          </span>
        </template>
      </Column>

      <!-- Permission Preview -->
      <Column header="Assigned Permissions" style="width: 35%">
        <template #body="{ data: role }">
          <span class="text-sm font-medium text-secondary-text">
            {{ getPermissionPreview(role) }}
          </span>
        </template>
      </Column>

      <!-- Created Date -->
      <Column header="Created">
        <template #body="{ data: role }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(role.createdAt) }}
          </span>
        </template>
      </Column>

      <!-- Updated Date -->
      <Column header="Updated">
        <template #body="{ data: role }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(role.updatedAt) }}
          </span>
        </template>
      </Column>

      <!-- Status -->
      <Column header="Status">
        <template #body>
          <span
            class="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-success/20"
          >
            Active
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 190px">
        <template #body="{ data: role }">
          <div class="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              class="h-8 cursor-pointer gap-1 rounded-lg border-border bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              title="Edit role"
              @click.stop="openUpdateModal(role)"
            >
              <Pencil class="h-3.5 w-3.5" :stroke-width="2" />

              Edit
            </Button>

            <Button
              type="button"
              variant="outline"
              class="h-8 cursor-pointer gap-1 rounded-lg border-border bg-card px-3 text-xs font-semibold text-error shadow-none transition-colors hover:border-error hover:bg-error/10 hover:text-error"
              title="Delete role"
              :disabled="deletingRoleId === role.id"
              @click.stop="handleDeleteRole(role)"
            >
              <LoaderCircle
                v-if="deletingRoleId === role.id"
                class="h-3.5 w-3.5 animate-spin"
                :stroke-width="2"
              />

              <Trash2 v-else class="h-3.5 w-3.5" :stroke-width="2" />

              {{ deletingRoleId === role.id ? 'Deleting...' : 'Delete' }}
            </Button>
          </div>
        </template>
      </Column>
    </template>

    <template #empty> No cooperative member roles found. </template>
  </EntityTable>

  <CooperativeMemberRoleModal
    :open="isModalOpen"
    :role="selectedRole"
    :is-submitting="isSubmitting"
    @close="closeModal"
    @submit="handleSubmitRole"
  />
</template>
