<script setup lang="ts">
import { computed, ref } from 'vue';

import { LoaderCircle, Pencil, Trash2 } from 'lucide-vue-next';

import Column from 'primevue/column';

import EntityTable from '@/components/shared/EntityTable.vue';
import { Button } from '@/components/ui/button';

import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative.ts';

import CooperativeMemberModal from './CooperativeMemberModal.vue';

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
import { parseApiFieldErrors, getGeneralApiError } from '@/utils/formErrors';
import CooperativeMemberDrawer from './CooperativeMemberDrawer.vue';

const serverErrors = ref<FieldErrors>({});
const generalSubmitError = ref('');

const searchInput = ref('');
const appliedSearch = ref('');
const page = ref(1);
const pageSize = ref(10);

const isModalOpen = ref(false);
const selectedMember = ref<CooperativeMember | null>(null);
const deletingMemberId = ref<string | null>(null);

const { activeCooperativeId, activeCooperative } = useActiveCooperative();

const queryParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: appliedSearch.value || undefined,
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

const isSubmitting = computed(
  () => createMutation.isPending.value || updateMutation.isPending.value,
);

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  return 'Failed to load cooperative members.';
});

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
  selectedMember.value = null;
  isModalOpen.value = true;
};

const openUpdateModal = (member: CooperativeMember) => {
  selectedMember.value = member;
  isModalOpen.value = true;
};

const closeModal = () => {
  selectedMember.value = null;
  isModalOpen.value = false;
};

const handleSubmitMember = async (payload: CooperativeMemberPayload) => {
  serverErrors.value = {};
  generalSubmitError.value = '';

  try {
    if (selectedMember.value) {
      await updateMutation.mutateAsync({
        id: selectedMember.value.id,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    closeModal();
  } catch (error) {
    serverErrors.value = parseApiFieldErrors(error);
    generalSubmitError.value = getGeneralApiError(error);
  }
};

const handleDeleteMember = async (member: CooperativeMember) => {
  const memberName = getFullName(member);

  const shouldDelete = window.confirm(`Are you sure you want to delete ${memberName}?`);

  if (!shouldDelete) {
    return;
  }

  deletingMemberId.value = member.id;

  try {
    await deleteMutation.mutateAsync(member.id);
  } finally {
    deletingMemberId.value = null;
  }
};
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
    v-model:search-value="searchInput"
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
      <!-- Member Information -->
      <Column header="Member Information" style="width: 28%">
        <template #body="{ data: member }">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary"
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

      <!-- Member Number -->
      <Column header="Member Number">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ member.memberNumber || 'Not assigned' }}
          </span>
        </template>
      </Column>

      <!-- Identification -->
      <Column header="Identification">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ member.identificationNumber || 'Not provided' }}
          </span>
        </template>
      </Column>

      <!-- Location -->
      <Column header="Location">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ member.profile?.county || member.profile?.location || 'Not provided' }}
          </span>
        </template>
      </Column>

      <!-- Role -->
      <Column header="Role">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ member.role?.name || 'Standard Member' }}
          </span>
        </template>
      </Column>

      <!-- Status -->
      <Column header="Status">
        <template #body="{ data: member }">
          <span
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
            :class="getStatusClass(member.status)"
          >
            {{ member.status }}
          </span>
        </template>
      </Column>

      <!-- Joined Date -->
      <Column header="Joined">
        <template #body="{ data: member }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(member.joinedAt) }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 190px">
        <template #body="{ data: member }">
          <div class="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              class="h-8 cursor-pointer gap-1 rounded-lg border-border bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              title="Edit member"
              @click.stop="openUpdateModal(member)"
            >
              <Pencil class="h-3.5 w-3.5" :stroke-width="2" />

              Edit
            </Button>

            <Button
              type="button"
              variant="outline"
              class="h-8 cursor-pointer gap-1 rounded-lg border-border bg-card px-3 text-xs font-semibold text-error shadow-none transition-colors hover:border-error hover:bg-error/10 hover:text-error"
              title="Delete member"
              :disabled="deletingMemberId === member.id"
              @click.stop="handleDeleteMember(member)"
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

  <!-- <CooperativeMemberModal
    :open="isModalOpen"
    :member="selectedMember"
    :is-submitting="isSubmitting"
    :server-errors="serverErrors"
    :general-error="generalSubmitError"
    @close="closeModal"
    @submit="handleSubmitMember"
  /> -->

  <CooperativeMemberDrawer
    :open="isModalOpen"
    :member="selectedMember"
    :is-submitting="isSubmitting"
    :server-errors="serverErrors"
    :general-error="generalSubmitError"
    @close="closeModal"
    @submit="handleSubmitMember"
  />
</template>
