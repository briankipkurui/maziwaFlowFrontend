<script setup lang="ts">
import { computed, ref } from 'vue';

import { Pencil } from 'lucide-vue-next';

import Column from 'primevue/column';

import EntityTable from '@/components/shared/EntityTable.vue';

import { Button } from '@/components/ui/button';

import CooperativeUnionModal from '../components/CooperativeUnionModal.vue';

import { useCooperativeUnionsQuery } from '../composables/queries/useCooperativeUnionsQuery';

import {
  useCreateCooperativeUnionMutation,
  useUpdateCooperativeUnionMutation,
} from '../composables/mutations/cooperativeUnionMutations';

import type { CooperativeUnion, CooperativeUnionPayload } from '../types/cooperativeUnion';

const search = ref('');
const page = ref(1);

const isModalOpen = ref(false);
const selectedUnion = ref<CooperativeUnion | null>(null);

const queryParams = computed(() => ({
  page: page.value,
  search: search.value.trim() || undefined,
}));

const { data, isLoading, isError, error, refetch } = useCooperativeUnionsQuery(queryParams);

const createMutation = useCreateCooperativeUnionMutation();
const updateMutation = useUpdateCooperativeUnionMutation();

const cooperativeUnions = computed(() => data.value?.results ?? []);
const totalItems = computed(() => data.value?.totalItems ?? 0);
const totalPages = computed(() => data.value?.totalPages ?? 1);
const currentPage = computed(() => data.value?.currentPage ?? page.value);
const hasNextPage = computed(() => data.value?.hasNextPage ?? false);
const hasPreviousPage = computed(() => data.value?.hasPreviousPage ?? false);

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  return 'Failed to load cooperative unions.';
});

const isSubmitting = computed(
  () => createMutation.isPending.value || updateMutation.isPending.value,
);

const handleSearch = () => {
  page.value = 1;
  refetch();
};

const clearSearch = () => {
  search.value = '';
  page.value = 1;
  refetch();
};

const nextPage = () => {
  if (!hasNextPage.value) return;

  page.value += 1;
};

const previousPage = () => {
  if (!hasPreviousPage.value) return;

  page.value -= 1;
};

const openCreateModal = () => {
  selectedUnion.value = null;
  isModalOpen.value = true;
};

const openUpdateModal = (union: CooperativeUnion) => {
  selectedUnion.value = union;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedUnion.value = null;
};

const handleSubmitUnion = async (payload: CooperativeUnionPayload) => {
  if (selectedUnion.value) {
    await updateMutation.mutateAsync({
      id: selectedUnion.value.id,
      payload,
    });
  } else {
    await createMutation.mutateAsync(payload);
  }

  await refetch();
  closeModal();
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
  <EntityTable
    v-model:search-value="search"
    title="Cooperative Unions"
    description="Manage cooperative unions and their registration details."
    search-placeholder="Search cooperative unions"
    create-label="Create Union"
    item-label="union(s)"
    :rows="cooperativeUnions"
    :total-items="totalItems"
    :current-page="currentPage"
    :total-pages="totalPages"
    :has-previous-page="hasPreviousPage"
    :has-next-page="hasNextPage"
    :is-loading="isLoading"
    :is-error="isError"
    :error-message="errorMessage"
    @search="handleSearch"
    @clear="clearSearch"
    @refresh="refetch()"
    @create="openCreateModal"
    @previous="previousPage"
    @next="nextPage"
  >
    <template #columns>
      <!-- Union Information -->
      <Column header="Union Information" header-class="w-[28%]">
        <template #body="{ data: union }">
          <div class="flex items-center gap-3.5">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-sm font-bold text-primary"
            >
              {{ union.name.charAt(0).toUpperCase() }}
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-heading">
                {{ union.name }}
              </p>
            </div>
          </div>
        </template>
      </Column>

      <!-- County -->
      <Column field="county" header="County">
        <template #body="{ data: union }">
          <span class="text-sm font-medium text-secondary-text">
            {{ union.county || 'Not provided' }}
          </span>
        </template>
      </Column>

      <!-- Ward -->
      <Column field="ward" header="Ward">
        <template #body="{ data: union }">
          <span class="text-sm font-medium text-secondary-text">
            {{ union.ward || 'Not provided' }}
          </span>
        </template>
      </Column>

      <!-- KRA PIN -->
      <Column field="kraPin" header="KRA PIN">
        <template #body="{ data: union }">
          <span
            class="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            {{ union.kraPin || 'Not provided' }}
          </span>
        </template>
      </Column>

      <!-- Created At -->
      <Column field="createdAt" header="Created At">
        <template #body="{ data: union }">
          <span class="text-sm font-medium text-secondary-text">
            {{ formatDate(union.createdAt) }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Action" header-class="text-right">
        <template #body="{ data: union }">
          <div class="flex justify-end">
            <Button
              type="button"
              variant="outline"
              class="h-9 cursor-pointer gap-1.5 rounded-lg border-border/60 bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              title="Edit cooperative union"
              @click.stop="openUpdateModal(union)"
            >
              <Pencil class="h-3.5 w-3.5" :stroke-width="2" />

              Edit
            </Button>
          </div>
        </template>
      </Column>
    </template>

    <template #empty> No cooperative unions found. </template>
  </EntityTable>

  <CooperativeUnionModal
    :open="isModalOpen"
    :union="selectedUnion"
    :is-submitting="isSubmitting"
    @close="closeModal"
    @submit="handleSubmitUnion"
  />
</template>
