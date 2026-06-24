<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { LoaderCircle, Pencil, Trash2 } from 'lucide-vue-next';

import Column from 'primevue/column';

import EntityTable from '@/components/shared/EntityTable.vue';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog.vue';

import { Button } from '@/components/ui/button';

import CooperativeModal from './CooperativeModal.vue';

import { useCooperativesQuery } from '../composables/queries/cooperativeQueries.ts';

import {
  useCreateCooperativeMutation,
  useDeleteCooperativeMutation,
  useUpdateCooperativeMutation,
} from '../composables/mutations/cooperativeMutations.ts';

import type { Cooperative, CooperativePayload } from '../types/cooperative.ts';
import type { FieldErrors } from '@/utils/formErrors';
import { useAuthFeatureStore } from '@/features/auth/stores/authStore.js';

const search = ref('');
const page = ref(1);
const pageSize = ref(10);

const isModalOpen = ref(false);
const selectedCooperative = ref<Cooperative | null>(null);

const isDeleteDialogOpen = ref(false);
const cooperativeToDelete = ref<Cooperative | null>(null);
const deletingCooperativeId = ref<string | null>(null);
const deleteError = ref('');

const serverErrors = ref<FieldErrors>({});
const generalError = ref('');

const authStore = useAuthFeatureStore();
const { user, activeCooperative } = storeToRefs(authStore);

/**
 * Permission names from backend may come in slightly different casing.
 * This makes checks safer:
 * "Cooperative.Create.Cooperative" -> "cooperative.create.cooperative"
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

const canCreateCooperative = computed(() => hasAnyPermission(['cooperative.create.cooperative']));

const canUpdateCooperative = computed(() => hasAnyPermission(['cooperative.update.cooperative']));

const canDeleteCooperative = computed(() => hasAnyPermission(['cooperative.delete.cooperative']));

const queryParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: search.value.trim() || undefined,
}));

const { data, isLoading, isError, error, refetch } = useCooperativesQuery(queryParams);

const createMutation = useCreateCooperativeMutation();
const updateMutation = useUpdateCooperativeMutation();
const deleteMutation = useDeleteCooperativeMutation();

const cooperatives = computed(() => data.value?.results ?? []);
const totalItems = computed(() => data.value?.totalItems ?? 0);
const totalPages = computed(() => data.value?.totalPages ?? 1);
const currentPage = computed(() => data.value?.currentPage ?? page.value);
const hasNextPage = computed(() => data.value?.hasNextPage ?? false);
const hasPreviousPage = computed(() => data.value?.hasPreviousPage ?? false);

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  return 'Failed to load cooperatives.';
});

const isSubmitting = computed(
  () => createMutation.isPending.value || updateMutation.isPending.value,
);

const isDeleting = computed(() => deleteMutation.isPending.value);

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
      'Unable to save cooperative. Please check the details and try again.';
  }

  return {
    fieldErrors: nextFieldErrors,
    generalError: nextGeneralError,
  };
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

const openCreateModal = () => {
  if (!canCreateCooperative.value) {
    return;
  }

  clearFormErrors();
  selectedCooperative.value = null;
  isModalOpen.value = true;
};

const openUpdateModal = (cooperative: Cooperative) => {
  if (!canUpdateCooperative.value) {
    return;
  }

  clearFormErrors();
  selectedCooperative.value = cooperative;
  isModalOpen.value = true;
};

const closeModal = () => {
  if (isSubmitting.value) {
    return;
  }

  clearFormErrors();
  isModalOpen.value = false;
  selectedCooperative.value = null;
};

const handleSubmitCooperative = async (payload: CooperativePayload) => {
  clearFormErrors();

  try {
    if (selectedCooperative.value) {
      if (!canUpdateCooperative.value) {
        generalError.value = 'You do not have permission to update cooperatives.';
        return;
      }

      await updateMutation.mutateAsync({
        id: selectedCooperative.value.id,
        payload,
      });
    } else {
      if (!canCreateCooperative.value) {
        generalError.value = 'You do not have permission to create cooperatives.';
        return;
      }

      await createMutation.mutateAsync(payload);
    }

    await refetch();
    closeModal();
  } catch (error) {
    const extractedErrors = extractMutationErrors(error);

    serverErrors.value = extractedErrors.fieldErrors;
    generalError.value = extractedErrors.generalError;
  }
};

const openDeleteDialog = (cooperative: Cooperative) => {
  if (!canDeleteCooperative.value) {
    return;
  }

  deleteError.value = '';
  cooperativeToDelete.value = cooperative;
  isDeleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  if (isDeleting.value) {
    return;
  }

  deleteError.value = '';
  cooperativeToDelete.value = null;
  isDeleteDialogOpen.value = false;
};

const handleConfirmDeleteCooperative = async () => {
  if (!cooperativeToDelete.value) {
    return;
  }

  if (!canDeleteCooperative.value) {
    deleteError.value = 'You do not have permission to delete cooperatives.';
    return;
  }

  deletingCooperativeId.value = cooperativeToDelete.value.id;
  deleteError.value = '';

  try {
    await deleteMutation.mutateAsync(cooperativeToDelete.value.id);
    await refetch();
    closeDeleteDialog();
  } catch (error) {
    console.error(error);

    const extractedErrors = extractMutationErrors(error);
    deleteError.value =
      extractedErrors.generalError || 'Unable to delete cooperative. Please try again.';
  } finally {
    deletingCooperativeId.value = null;
  }
};

const formatDate = (date?: string) => {
  if (!date) {
    return 'Not available';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available';
  }

  return parsedDate.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getInitials = (groupName?: string) => {
  if (!groupName) {
    return 'CO';
  }

  return groupName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};
</script>

<template>
  <EntityTable
    v-model:search-value="search"
    v-model:page-size="pageSize"
    title="Cooperatives"
    description="Manage registered cooperatives and their details."
    search-placeholder="Search cooperatives"
    create-label="Create Cooperative"
    item-label="cooperative(s)"
    :rows="cooperatives"
    :total-items="totalItems"
    :current-page="currentPage"
    :total-pages="totalPages"
    :has-previous-page="hasPreviousPage"
    :has-next-page="hasNextPage"
    :page-size-options="[10, 50, 100]"
    :is-loading="isLoading"
    :is-error="isError"
    :error-message="errorMessage"
    :can-create="canCreateCooperative"
    data-key="id"
    wide
    @page-size-change="handlePageSizeChange"
    @search="handleSearch"
    @clear="clearSearch"
    @refresh="() => refetch()"
    @create="openCreateModal"
    @previous="previousPage"
    @next="nextPage"
  >
    <template #columns>
      <Column header="Cooperative Information" header-class="w-[28%]">
        <template #body="{ data: cooperative }">
          <div class="flex items-center gap-3.5">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-sm font-bold text-primary"
            >
              {{ getInitials(cooperative.groupName) }}
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-heading">
                {{ cooperative.groupName }}
              </p>
            </div>
          </div>
        </template>
      </Column>

      <Column field="code" header="Code">
        <template #body="{ data: cooperative }">
          <span class="text-sm font-medium text-secondary-text">
            {{ cooperative.code || 'Not provided' }}
          </span>
        </template>
      </Column>

      <Column field="county" header="County">
        <template #body="{ data: cooperative }">
          <span class="text-sm font-medium text-secondary-text">
            {{ cooperative.county || 'Not specified' }}
          </span>
        </template>
      </Column>

      <Column field="mainActivity" header="Main Activity">
        <template #body="{ data: cooperative }">
          <span class="text-sm font-medium text-secondary-text">
            {{ cooperative.mainActivity || 'Not specified' }}
          </span>
        </template>
      </Column>

      <Column field="hasInsurance" header="Insurance">
        <template #body="{ data: cooperative }">
          <span
            v-if="cooperative.hasInsurance"
            class="inline-flex rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold text-success"
          >
            Insured
          </span>

          <span
            v-else
            class="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-secondary-text"
          >
            Not insured
          </span>
        </template>
      </Column>

      <Column field="kraPin" header="KRA PIN">
        <template #body="{ data: cooperative }">
          <span
            class="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            {{ cooperative.kraPin || 'Not provided' }}
          </span>
        </template>
      </Column>

      <Column field="createdAt" header="Created At">
        <template #body="{ data: cooperative }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(cooperative.createdAt) }}
          </span>
        </template>
      </Column>

      <Column
        v-if="canUpdateCooperative || canDeleteCooperative"
        header="Action"
        header-class="text-right"
      >
        <template #body="{ data: cooperative }">
          <div class="flex justify-end gap-2">
            <Button
              v-if="canUpdateCooperative"
              type="button"
              variant="outline"
              class="h-9 cursor-pointer gap-1.5 rounded-lg border-border/60 bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              title="Edit cooperative"
              :disabled="deletingCooperativeId === cooperative.id"
              @click.stop="openUpdateModal(cooperative)"
            >
              <Pencil class="h-3.5 w-3.5" :stroke-width="2" />

              Edit
            </Button>

            <Button
              v-if="canDeleteCooperative"
              type="button"
              variant="outline"
              class="h-9 cursor-pointer gap-1.5 rounded-lg border-border/60 bg-card px-3 text-xs font-semibold text-error shadow-none transition-colors hover:border-error hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-60"
              title="Delete cooperative"
              :disabled="isDeleting"
              @click.stop="openDeleteDialog(cooperative)"
            >
              <LoaderCircle
                v-if="deletingCooperativeId === cooperative.id"
                class="h-3.5 w-3.5 animate-spin"
                :stroke-width="2"
              />

              <Trash2 v-else class="h-3.5 w-3.5" :stroke-width="2" />

              {{ deletingCooperativeId === cooperative.id ? 'Deleting...' : 'Delete' }}
            </Button>
          </div>
        </template>
      </Column>
    </template>

    <template #empty> No cooperatives found. </template>
  </EntityTable>

  <CooperativeModal
    :open="isModalOpen"
    :cooperative="selectedCooperative"
    :is-submitting="isSubmitting"
    :server-errors="serverErrors"
    :general-error="generalError"
    @close="closeModal"
    @submit="handleSubmitCooperative"
  />

  <DeleteConfirmDialog
    :open="isDeleteDialogOpen"
    title="Delete Cooperative"
    :item-name="cooperativeToDelete?.groupName ?? ''"
    confirm-label="Delete Cooperative"
    :is-deleting="isDeleting"
    :error-message="deleteError"
    @close="closeDeleteDialog"
    @confirm="handleConfirmDeleteCooperative"
  />
</template>
