<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { LoaderCircle, Pencil, ShieldCheck, Trash2 } from 'lucide-vue-next';

import Column from 'primevue/column';

import EntityTable from '@/components/shared/EntityTable.vue';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog.vue';

import { Button } from '@/components/ui/button';

import { useAuthFeatureStore } from '@/features/auth/stores/authStore.js';

import { useCooperativeMemberRolesQuery } from '../composables/queries/cooperativeMemberRoleQueries.ts';

import {
  useCreateCooperativeMemberRoleMutation,
  useDeleteCooperativeMemberRoleMutation,
  useReplaceCooperativeMemberRolePermissionsMutation,
  useUpdateCooperativeMemberRoleMutation,
} from '../composables/mutations/cooperativeMemberRoleMutations.ts';

import type {
  CooperativeMemberRole,
  CooperativeMemberRolePayload,
} from '../types/cooperativeMemberRoleTypes.ts';

import type { FieldErrors } from '@/utils/formErrors';

import CooperativeMemberRoleDrawer from './CooperativeMemberRoleDrawer.vue';

const search = ref('');
const page = ref(1);
const pageSize = ref(10);

const isDrawerOpen = ref(false);
const selectedRole = ref<CooperativeMemberRole | null>(null);

const isDeleteDialogOpen = ref(false);
const roleToDelete = ref<CooperativeMemberRole | null>(null);
const deletingRoleId = ref<string | null>(null);
const deleteError = ref('');

const serverErrors = ref<FieldErrors>({});
const generalError = ref('');

const authStore = useAuthFeatureStore();
const { user, activeCooperative } = storeToRefs(authStore);

/**
 * Permission names from backend may come in slightly different casing.
 * This makes checks safer:
 * "Cooperative Member Role.Create.Role" -> "cooperative-member-role.create.role"
 */
const normalizePermissionName = (permissionName: string): string => {
  return permissionName.trim().toLowerCase().replace(/\s+/g, '-');
};

const permissionNames = computed<string[]>(() => {
  const names = new Set<string>();

  for (const permission of user.value?.role?.permissions ?? []) {
    if (permission.name) {
      names.add(normalizePermissionName(permission.name));
    }
  }

  for (const permission of activeCooperative.value?.permissions ?? []) {
    if (permission.name) {
      names.add(normalizePermissionName(permission.name));
    }
  }

  for (const role of activeCooperative.value?.roles ?? []) {
    for (const permission of role.permissions ?? []) {
      if (permission.name) {
        names.add(normalizePermissionName(permission.name));
      }
    }
  }

  return Array.from(names);
});

const hasPermission = (permissionName: string): boolean => {
  return permissionNames.value.includes(normalizePermissionName(permissionName));
};

const hasAnyPermission = (permissionNamesToCheck: string[]): boolean => {
  return permissionNamesToCheck.some((permissionName) => hasPermission(permissionName));
};

const canCreateRole = computed(() =>
  hasAnyPermission(['role.create.role', 'role.assign.permission']),
);

const canUpdateRole = computed(() =>
  hasAnyPermission(['role.update.role', 'role.assign.permission']),
);

const canDeleteRole = computed(() => hasAnyPermission(['role.delete.role']));

const queryParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: search.value.trim() || undefined,
}));

const { data, isLoading, isError, error, refetch } = useCooperativeMemberRolesQuery(queryParams);

const createMutation = useCreateCooperativeMemberRoleMutation();
const updateMutation = useUpdateCooperativeMemberRoleMutation();
const replacePermissionsMutation = useReplaceCooperativeMemberRolePermissionsMutation();
const deleteMutation = useDeleteCooperativeMemberRoleMutation();

const roles = computed(() => data.value?.results ?? []);
const totalItems = computed(() => data.value?.totalItems ?? 0);
const totalPages = computed(() => data.value?.totalPages ?? 1);
const currentPage = computed(() => data.value?.currentPage ?? page.value);
const hasNextPage = computed(() => data.value?.hasNextPage ?? false);
const hasPreviousPage = computed(() => data.value?.hasPreviousPage ?? false);

const isSubmitting = computed(
  () =>
    createMutation.isPending.value ||
    updateMutation.isPending.value ||
    replacePermissionsMutation.isPending.value,
);

const isDeleting = computed(() => deleteMutation.isPending.value);

const tableDescription = computed(
  () => 'Manage cooperative member roles and the permissions assigned to each role.',
);

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  return 'Failed to load cooperative member roles.';
});

const clearFormErrors = () => {
  serverErrors.value = {};
  generalError.value = '';
};

type ApiValidationErrorItem = {
  field?: string;
  property?: string;
  message?: string | string[];
  constraints?: Record<string, string>;
};

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  errors?: Record<string, string | string[]> | ApiValidationErrorItem[];
};

const getNestedValue = (source: unknown, path: string): unknown => {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    return (value as Record<string, unknown>)[key];
  }, source);
};

const normalizeMessage = (message: unknown): string => {
  if (Array.isArray(message)) {
    return message.filter(Boolean).join(', ');
  }

  if (typeof message === 'string') {
    return message;
  }

  return '';
};

const extractMutationErrors = (error: unknown) => {
  const responseData =
    getNestedValue(error, 'response.data') ?? getNestedValue(error, 'data') ?? error;

  const apiError = responseData as ApiErrorResponse;

  const nextFieldErrors: FieldErrors = {};
  let nextGeneralError = '';

  if (Array.isArray(apiError.errors)) {
    for (const item of apiError.errors) {
      const field = item.field ?? item.property;
      const message =
        normalizeMessage(item.message) ||
        normalizeMessage(Object.values(item.constraints ?? {})[0]);

      if (field && message) {
        nextFieldErrors[field] = message;
      }
    }
  } else if (apiError.errors && typeof apiError.errors === 'object') {
    for (const [field, message] of Object.entries(apiError.errors)) {
      nextFieldErrors[field] = normalizeMessage(message);
    }
  }

  if (!Object.keys(nextFieldErrors).length) {
    const message = normalizeMessage(apiError.message);

    nextGeneralError =
      message ||
      apiError.error ||
      'Unable to save cooperative member role. Please check the details and try again.';
  }

  return {
    fieldErrors: nextFieldErrors,
    generalError: nextGeneralError,
  };
};

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

const getPermissionCount = (role: CooperativeMemberRole): number => {
  return role.permissions?.length ?? 0;
};

const handleSearch = () => {
  page.value = 1;
  refetch();
};

const clearSearch = () => {
  search.value = '';
  page.value = 1;
  refetch();
};

const handlePageSizeChange = (value: number) => {
  pageSize.value = value;
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

const openCreateDrawer = () => {
  if (!canCreateRole.value) {
    return;
  }

  clearFormErrors();
  selectedRole.value = null;
  isDrawerOpen.value = true;
};

const openUpdateDrawer = (role: CooperativeMemberRole) => {
  if (!canUpdateRole.value) {
    return;
  }

  clearFormErrors();
  selectedRole.value = role;
  isDrawerOpen.value = true;
};

const closeDrawer = () => {
  if (isSubmitting.value) {
    return;
  }

  clearFormErrors();
  selectedRole.value = null;
  isDrawerOpen.value = false;
};

const handleSubmitRole = async (payload: CooperativeMemberRolePayload) => {
  clearFormErrors();

  const permissionIds = payload.permissionIds ?? [];

  /**
   * Important:
   * Do not send permissionIds to create/update role endpoint.
   * permissionIds must only go to the replace permissions endpoint.
   */
  const rolePayload = {
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
  };

  try {
    if (selectedRole.value?.id) {
      if (!canUpdateRole.value) {
        generalError.value = 'You do not have permission to update cooperative member roles.';
        return;
      }

      await updateMutation.mutateAsync({
        id: selectedRole.value.id,
        payload: rolePayload,
      });

      await replacePermissionsMutation.mutateAsync({
        id: selectedRole.value.id,
        payload: {
          permissionIds,
        },
      });
    } else {
      if (!canCreateRole.value) {
        generalError.value = 'You do not have permission to create cooperative member roles.';
        return;
      }

      const createdRole = await createMutation.mutateAsync(rolePayload);

      await replacePermissionsMutation.mutateAsync({
        id: createdRole.id,
        payload: {
          permissionIds,
        },
      });
    }

    await refetch();
    closeDrawer();
  } catch (error) {
    console.error(error);

    const extractedErrors = extractMutationErrors(error);

    serverErrors.value = extractedErrors.fieldErrors;
    generalError.value = extractedErrors.generalError;
  }
};

const openDeleteDialog = (role: CooperativeMemberRole) => {
  if (!canDeleteRole.value) {
    return;
  }

  deleteError.value = '';
  roleToDelete.value = role;
  isDeleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  if (isDeleting.value) {
    return;
  }

  deleteError.value = '';
  roleToDelete.value = null;
  isDeleteDialogOpen.value = false;
};

const handleConfirmDeleteRole = async () => {
  if (!roleToDelete.value) {
    return;
  }

  if (!canDeleteRole.value) {
    deleteError.value = 'You do not have permission to delete cooperative member roles.';
    return;
  }

  deletingRoleId.value = roleToDelete.value.id;
  deleteError.value = '';

  try {
    await deleteMutation.mutateAsync(roleToDelete.value.id);
    await refetch();
    closeDeleteDialog();
  } catch (error) {
    console.error(error);

    const extractedErrors = extractMutationErrors(error);
    deleteError.value =
      extractedErrors.generalError || 'Unable to delete cooperative member role. Please try again.';
  } finally {
    deletingRoleId.value = null;
  }
};

const deleteRoleName = computed(() => roleToDelete.value?.name ?? '');
</script>

<template>
  <EntityTable
    v-model:search-value="search"
    v-model:page-size="pageSize"
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
    :page-size-options="[10, 50, 100]"
    :is-loading="isLoading"
    :is-error="isError"
    :error-message="errorMessage"
    :can-create="canCreateRole"
    data-key="id"
    wide
    @page-size-change="handlePageSizeChange"
    @search="handleSearch"
    @clear="clearSearch"
    @refresh="() => refetch()"
    @create="openCreateDrawer"
    @previous="previousPage"
    @next="nextPage"
  >
    <template #columns>
      <Column header="Role Information" header-class="w-[30%]">
        <template #body="{ data: role }">
          <div class="flex items-center gap-3.5">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary"
            >
              <ShieldCheck class="h-5 w-5" :stroke-width="2" />
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-heading">
                {{ role.name }}
              </p>

              <p
                v-if="role.description"
                class="mt-0.5 line-clamp-1 text-xs font-medium text-secondary-text"
              >
                {{ role.description }}
              </p>
            </div>
          </div>
        </template>
      </Column>

      <Column header="Permissions">
        <template #body="{ data: role }">
          <span
            class="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            {{ getPermissionCount(role) }}
            {{ getPermissionCount(role) === 1 ? 'permission' : 'permissions' }}
          </span>
        </template>
      </Column>

      <Column field="createdAt" header="Created">
        <template #body="{ data: role }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(role.createdAt) }}
          </span>
        </template>
      </Column>

      <Column field="updatedAt" header="Updated">
        <template #body="{ data: role }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(role.updatedAt) }}
          </span>
        </template>
      </Column>

      <Column header="Status">
        <template #body>
          <span
            class="inline-flex rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold text-success"
          >
            Active
          </span>
        </template>
      </Column>

      <Column v-if="canUpdateRole || canDeleteRole" header="Action" header-class="text-right">
        <template #body="{ data: role }">
          <div class="flex justify-end gap-2">
            <Button
              v-if="canUpdateRole"
              type="button"
              variant="outline"
              class="h-9 cursor-pointer gap-1.5 rounded-lg border-border/60 bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              title="Edit cooperative member role"
              :disabled="deletingRoleId === role.id"
              @click.stop="openUpdateDrawer(role)"
            >
              <Pencil class="h-3.5 w-3.5" :stroke-width="2" />

              Edit
            </Button>

            <Button
              v-if="canDeleteRole"
              type="button"
              variant="outline"
              class="h-9 cursor-pointer gap-1.5 rounded-lg border-border/60 bg-card px-3 text-xs font-semibold text-error shadow-none transition-colors hover:border-error hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-60"
              title="Delete cooperative member role"
              :disabled="isDeleting"
              @click.stop="openDeleteDialog(role)"
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

  <CooperativeMemberRoleDrawer
    :open="isDrawerOpen"
    :role="selectedRole"
    :is-submitting="isSubmitting"
    :server-errors="serverErrors"
    :general-error="generalError"
    @close="closeDrawer"
    @submit="handleSubmitRole"
  />

  <DeleteConfirmDialog
    :open="isDeleteDialogOpen"
    title="Delete Cooperative Member Role"
    :item-name="deleteRoleName"
    confirm-label="Delete Role"
    :is-deleting="isDeleting"
    :error-message="deleteError"
    @close="closeDeleteDialog"
    @confirm="handleConfirmDeleteRole"
  />
</template>
