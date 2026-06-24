<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { LoaderCircle, Pencil, Trash2 } from 'lucide-vue-next';

import Column from 'primevue/column';

import EntityTable from '@/components/shared/EntityTable.vue';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog.vue';

import { Button } from '@/components/ui/button';

import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative.ts';
import { useAuthFeatureStore } from '@/features/auth/stores/authStore.js';

import { useCooperativeMembersQuery } from '../composables/queries/cooperativeMemberQueries';

import {
  useCreateCooperativeMemberMutation,
  useDeleteCooperativeMemberMutation,
  useUpdateCooperativeMemberMutation,
} from '../composables/mutations/cooperativeMemberMutations';

import type {
  CooperativeMember,
  CooperativeMemberPayload,
  CooperativeMemberStatus,
} from '../types/cooperativeMember';

import type { FieldErrors } from '@/utils/formErrors';
import CooperativeMemberDrawer from './CooperativeMemberDrawer.vue';

const search = ref('');
const page = ref(1);
const pageSize = ref(10);

const isDrawerOpen = ref(false);
const selectedMember = ref<CooperativeMember | null>(null);

const isDeleteDialogOpen = ref(false);
const memberToDelete = ref<CooperativeMember | null>(null);
const deletingMemberId = ref<string | null>(null);
const deleteError = ref('');

const serverErrors = ref<FieldErrors>({});
const generalError = ref('');

const { activeCooperativeId, activeCooperative } = useActiveCooperative();

const authStore = useAuthFeatureStore();
const { user, activeCooperative: authActiveCooperative } = storeToRefs(authStore);

/**
 * Permission names from backend may come in slightly different casing.
 * This makes checks safer:
 * "Cooperative Member.Create.Member" -> "cooperative-member.create.member"
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

  for (const permission of authActiveCooperative.value?.permissions ?? []) {
    if (permission.name) {
      names.add(normalizePermissionName(permission.name));
    }
  }

  for (const role of authActiveCooperative.value?.roles ?? []) {
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

const canCreateMember = computed(() => hasAnyPermission(['cooperative-member.create.member']));

const canUpdateMember = computed(() => hasAnyPermission(['cooperative-member.update.member']));

const canDeleteMember = computed(() => hasAnyPermission(['cooperative-member.delete.member']));

const queryParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: search.value.trim() || undefined,
}));

const { data, isLoading, isError, error, refetch } = useCooperativeMembersQuery(queryParams);

const createMutation = useCreateCooperativeMemberMutation();
const updateMutation = useUpdateCooperativeMemberMutation();
const deleteMutation = useDeleteCooperativeMemberMutation();

const members = computed(() => data.value?.results ?? []);
const totalItems = computed(() => data.value?.totalItems ?? 0);
const totalPages = computed(() => data.value?.totalPages ?? 1);
const currentPage = computed(() => data.value?.currentPage ?? page.value);
const hasNextPage = computed(() => data.value?.hasNextPage ?? false);
const hasPreviousPage = computed(() => data.value?.hasPreviousPage ?? false);

const cooperativeName = computed(
  () => activeCooperative.value?.cooperative.groupName ?? 'the logged-in cooperative',
);

const tableDescription = computed(
  () => `Manage members registered under ${cooperativeName.value}.`,
);

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  return 'Failed to load cooperative members.';
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
      'Unable to save cooperative member. Please check the details and try again.';
  }

  return {
    fieldErrors: nextFieldErrors,
    generalError: nextGeneralError,
  };
};

const getFullName = (member: CooperativeMember): string => {
  const fullName = [member.profile?.firstName, member.profile?.middleName, member.profile?.lastName]
    .filter(Boolean)
    .join(' ');

  return fullName || 'Unnamed member';
};

const getInitials = (member: CooperativeMember): string => {
  const initials = [member.profile?.firstName, member.profile?.lastName]
    .filter(Boolean)
    .map((name) => name?.charAt(0).toUpperCase())
    .join('');

  return initials || 'CM';
};

const getStatusClass = (status: CooperativeMemberStatus): string => {
  if (status === 'ACTIVE') {
    return 'bg-success/10 text-success ring-success/20';
  }

  if (status === 'SUSPENDED') {
    return 'bg-primary/10 text-primary ring-primary/20';
  }

  return 'bg-surface text-secondary-text ring-border';
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
  if (!canCreateMember.value) {
    return;
  }

  clearFormErrors();
  selectedMember.value = null;
  isDrawerOpen.value = true;
};

const openUpdateDrawer = (member: CooperativeMember) => {
  if (!canUpdateMember.value) {
    return;
  }

  clearFormErrors();
  selectedMember.value = member;
  isDrawerOpen.value = true;
};

const closeDrawer = () => {
  if (isSubmitting.value) {
    return;
  }

  clearFormErrors();
  selectedMember.value = null;
  isDrawerOpen.value = false;
};

const handleSubmitMember = async (payload: CooperativeMemberPayload) => {
  clearFormErrors();

  try {
    if (selectedMember.value) {
      if (!canUpdateMember.value) {
        generalError.value = 'You do not have permission to update cooperative members.';
        return;
      }

      await updateMutation.mutateAsync({
        id: selectedMember.value.id,
        payload,
      });
    } else {
      if (!canCreateMember.value) {
        generalError.value = 'You do not have permission to create cooperative members.';
        return;
      }

      await createMutation.mutateAsync(payload);
    }

    await refetch();
    closeDrawer();
  } catch (error) {
    const extractedErrors = extractMutationErrors(error);

    serverErrors.value = extractedErrors.fieldErrors;
    generalError.value = extractedErrors.generalError;
  }
};

const openDeleteDialog = (member: CooperativeMember) => {
  if (!canDeleteMember.value) {
    return;
  }

  deleteError.value = '';
  memberToDelete.value = member;
  isDeleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  if (isDeleting.value) {
    return;
  }

  deleteError.value = '';
  memberToDelete.value = null;
  isDeleteDialogOpen.value = false;
};

const handleConfirmDeleteMember = async () => {
  if (!memberToDelete.value) {
    return;
  }

  if (!canDeleteMember.value) {
    deleteError.value = 'You do not have permission to delete cooperative members.';
    return;
  }

  deletingMemberId.value = memberToDelete.value.id;
  deleteError.value = '';

  try {
    await deleteMutation.mutateAsync(memberToDelete.value.id);
    await refetch();
    closeDeleteDialog();
  } catch (error) {
    console.error(error);

    const extractedErrors = extractMutationErrors(error);
    deleteError.value =
      extractedErrors.generalError || 'Unable to delete cooperative member. Please try again.';
  } finally {
    deletingMemberId.value = null;
  }
};

const deleteMemberName = computed(() => {
  if (!memberToDelete.value) {
    return '';
  }

  return getFullName(memberToDelete.value);
});
</script>

<template>
  <!-- No cooperative linked to the logged-in account -->
  <section v-if="!activeCooperativeId" class="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
    <div class="mb-6">
      <h1 class="text-[26px] font-bold tracking-[-0.02em] text-heading">Cooperative Members</h1>

      <p class="mt-1.5 text-sm font-normal text-secondary-text">
        Manage members registered under your cooperative.
      </p>
    </div>

    <div
      class="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary"
    >
      No cooperative is linked to your logged-in account. Please log in again or contact the system
      administrator.
    </div>
  </section>

  <!-- Members table -->
  <EntityTable
    v-else
    v-model:search-value="search"
    v-model:page-size="pageSize"
    title="Cooperative Members"
    :description="tableDescription"
    search-placeholder="Search cooperative members"
    create-label="Create Member"
    item-label="member(s)"
    :rows="members"
    :total-items="totalItems"
    :current-page="currentPage"
    :total-pages="totalPages"
    :has-previous-page="hasPreviousPage"
    :has-next-page="hasNextPage"
    :page-size-options="[10, 50, 100]"
    :is-loading="isLoading"
    :is-error="isError"
    :error-message="errorMessage"
    :can-create="canCreateMember"
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
      <Column header="Member Information" header-class="w-[28%]">
        <template #body="{ data: member }">
          <div class="flex items-center gap-3.5">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-sm font-bold text-primary"
            >
              {{ getInitials(member) }}
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-heading">
                {{ getFullName(member) }}
              </p>
            </div>
          </div>
        </template>
      </Column>

      <Column field="memberNumber" header="Member Number">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ member.memberNumber || 'Not assigned' }}
          </span>
        </template>
      </Column>

      <Column field="identificationNumber" header="Identification">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ member.identificationNumber || 'Not provided' }}
          </span>
        </template>
      </Column>

      <Column header="Location">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ member.profile?.county || member.profile?.location || 'Not provided' }}
          </span>
        </template>
      </Column>

      <Column header="Role">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ member.role?.name || 'Standard Member' }}
          </span>
        </template>
      </Column>

      <Column field="status" header="Status">
        <template #body="{ data: member }">
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
            :class="getStatusClass(member.status)"
          >
            {{ member.status }}
          </span>
        </template>
      </Column>

      <Column field="joinedAt" header="Joined">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(member.joinedAt) }}
          </span>
        </template>
      </Column>

      <Column v-if="canUpdateMember || canDeleteMember" header="Action" header-class="text-right">
        <template #body="{ data: member }">
          <div class="flex justify-end gap-2">
            <Button
              v-if="canUpdateMember"
              type="button"
              variant="outline"
              class="h-9 cursor-pointer gap-1.5 rounded-lg border-border/60 bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              title="Edit cooperative member"
              :disabled="deletingMemberId === member.id"
              @click.stop="openUpdateDrawer(member)"
            >
              <Pencil class="h-3.5 w-3.5" :stroke-width="2" />

              Edit
            </Button>

            <Button
              v-if="canDeleteMember"
              type="button"
              variant="outline"
              class="h-9 cursor-pointer gap-1.5 rounded-lg border-border/60 bg-card px-3 text-xs font-semibold text-error shadow-none transition-colors hover:border-error hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-60"
              title="Delete cooperative member"
              :disabled="isDeleting"
              @click.stop="openDeleteDialog(member)"
            >
              <LoaderCircle
                v-if="deletingMemberId === member.id"
                class="h-3.5 w-3.5 animate-spin"
                :stroke-width="2"
              />

              <Trash2 v-else class="h-3.5 w-3.5" :stroke-width="2" />

              {{ deletingMemberId === member.id ? 'Deleting...' : 'Delete' }}
            </Button>
          </div>
        </template>
      </Column>
    </template>

    <template #empty> No cooperative members found. </template>
  </EntityTable>

  <CooperativeMemberDrawer
    :open="isDrawerOpen"
    :member="selectedMember"
    :is-submitting="isSubmitting"
    :server-errors="serverErrors"
    :general-error="generalError"
    @close="closeDrawer"
    @submit="handleSubmitMember"
  />

  <DeleteConfirmDialog
    :open="isDeleteDialogOpen"
    title="Delete Cooperative Member"
    :item-name="deleteMemberName"
    confirm-label="Delete Member"
    :is-deleting="isDeleting"
    :error-message="deleteError"
    @close="closeDeleteDialog"
    @confirm="handleConfirmDeleteMember"
  />
</template>
