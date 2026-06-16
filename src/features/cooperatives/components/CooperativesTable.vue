<script setup lang="ts">
import { computed, ref } from 'vue';

import { Pencil } from 'lucide-vue-next';

import Column from 'primevue/column';

import EntityTable from '@/components/shared/EntityTable.vue';
import { Button } from '@/components/ui/button';

import CooperativeModal from './CooperativeModal.vue';

import { useCooperativesQuery } from '../composables/queries/cooperativeQueries.ts';

import {
  useCreateCooperativeMutation,
  useUpdateCooperativeMutation,
} from '../composables/mutations/cooperativeMutations.ts';

import type { Cooperative, CooperativePayload } from '../types/cooperative.ts';

const searchInput = ref('');
const appliedSearch = ref('');
const page = ref(1);

const isModalOpen = ref(false);
const selectedCooperative = ref<Cooperative | null>(null);

const queryParams = computed(() => ({
  page: page.value,
  search: appliedSearch.value || undefined,
}));

const { data, isLoading, isError, error, refetch } = useCooperativesQuery(queryParams);

const createMutation = useCreateCooperativeMutation();
const updateMutation = useUpdateCooperativeMutation();

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
  selectedCooperative.value = null;
  isModalOpen.value = true;
};

const openUpdateModal = (cooperative: Cooperative) => {
  selectedCooperative.value = cooperative;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedCooperative.value = null;
};

const handleSubmitCooperative = async (payload: CooperativePayload) => {
  if (selectedCooperative.value) {
    await updateMutation.mutateAsync({
      id: selectedCooperative.value.id,
      payload,
    });
  } else {
    await createMutation.mutateAsync(payload);
  }

  closeModal();
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

const getInitials = (groupName: string) => {
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
    v-model:search-value="searchInput"
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
      <!-- Cooperative Information -->
      <Column header="Cooperative Information" style="width: 28%">
        <template #body="{ data: cooperative }">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary"
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

      <!-- Code -->
      <Column header="Code">
        <template #body="{ data: cooperative }">
          <span class="text-sm font-medium text-secondary-text">
            {{ cooperative.code || 'Not provided' }}
          </span>
        </template>
      </Column>

      <!-- County -->
      <Column header="County">
        <template #body="{ data: cooperative }">
          <span class="text-sm font-medium text-secondary-text">
            {{ cooperative.county || 'Not specified' }}
          </span>
        </template>
      </Column>

      <!-- Main Activity -->
      <Column header="Main Activity">
        <template #body="{ data: cooperative }">
          <span class="text-sm font-medium text-secondary-text">
            {{ cooperative.mainActivity || 'Not specified' }}
          </span>
        </template>
      </Column>

      <!-- Insurance -->
      <Column header="Insurance">
        <template #body="{ data: cooperative }">
          <span
            v-if="cooperative.hasInsurance"
            class="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-success/20"
          >
            Insured
          </span>

          <span
            v-else
            class="inline-flex rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-secondary-text ring-1 ring-border"
          >
            Not insured
          </span>
        </template>
      </Column>

      <!-- KRA PIN -->
      <Column header="KRA PIN">
        <template #body="{ data: cooperative }">
          <span
            class="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20"
          >
            {{ cooperative.kraPin || 'Not provided' }}
          </span>
        </template>
      </Column>

      <!-- Created Date -->
      <Column header="Created At">
        <template #body="{ data: cooperative }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(cooperative.createdAt) }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Action" style="width: 110px">
        <template #body="{ data: cooperative }">
          <div class="flex justify-end">
            <Button
              type="button"
              variant="outline"
              class="h-8 cursor-pointer gap-1 rounded-lg border-border bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              title="Edit cooperative"
              @click.stop="openUpdateModal(cooperative)"
            >
              <Pencil class="h-3.5 w-3.5" :stroke-width="2" />

              Edit
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
    @close="closeModal"
    @submit="handleSubmitCooperative"
  />
</template>
