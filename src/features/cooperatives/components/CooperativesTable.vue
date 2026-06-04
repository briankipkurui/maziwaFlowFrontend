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
  if (!hasNextPage.value) return;

  page.value += 1;
};

const previousPage = () => {
  if (!hasPreviousPage.value) return;

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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-KE', {
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
  <section class="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 md:px-7 lg:px-8">
    <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Cooperatives</h1>

        <p class="mt-1 text-xs text-slate-500 sm:text-sm">
          Manage registered cooperatives and their details.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form class="flex w-full gap-2 sm:w-auto" @submit.prevent="handleSearch">
          <Input
            v-model="searchInput"
            type="text"
            placeholder="Search cooperatives"
            class="h-10 w-full rounded-md border-slate-300 bg-white text-xs shadow-sm focus-visible:ring-green-600 sm:w-72 sm:text-sm md:w-80"
          />

          <Button
            type="submit"
            variant="outline"
            class="h-10 cursor-pointer px-4 text-xs font-semibold transition-all hover:bg-slate-100 active:scale-95"
          >
            Search
          </Button>

          <Button
            v-if="appliedSearch"
            type="button"
            variant="outline"
            class="h-10 cursor-pointer px-4 text-xs font-semibold transition-all hover:bg-slate-100 active:scale-95"
            @click="clearSearch"
          >
            Clear
          </Button>
        </form>

        <Button
          type="button"
          class="h-10 cursor-pointer rounded-md bg-green-700 px-5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:bg-green-800 hover:shadow-lg active:scale-95 sm:text-xs"
          title="Create a new cooperative"
          @click="openCreateModal"
        >
          Create Cooperative
        </Button>
      </div>
    </div>

    <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
      <p class="text-xs font-medium text-slate-500 sm:text-sm">
        Total: {{ totalItems }} cooperative(s)
      </p>

      <Button
        type="button"
        variant="outline"
        class="h-9 cursor-pointer px-4 text-xs font-semibold transition-all hover:bg-slate-100 active:scale-95"
        title="Refresh cooperatives"
        @click="refetch"
      >
        Refresh
      </Button>
    </div>

    <div
      v-if="isLoading"
      class="flex min-h-[250px] items-center justify-center bg-white text-xs text-slate-500 shadow-sm sm:text-sm"
    >
      Loading cooperatives...
    </div>

    <div
      v-else-if="isError"
      class="rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700 sm:text-sm"
    >
      {{ errorMessage }}
    </div>

    <div v-else class="overflow-x-auto bg-white shadow-sm">
      <Table class="min-w-[1300px]">
        <TableHeader>
          <TableRow class="border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
            <TableHead class="w-[28%] px-4 py-4 text-xs font-semibold text-slate-400">
              Cooperative Information
            </TableHead>

            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400"> Code </TableHead>

            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400"> County </TableHead>

            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">
              Main Activity
            </TableHead>

            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">
              Insurance
            </TableHead>

            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400"> KRA PIN </TableHead>

            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">
              Created At
            </TableHead>

            <TableHead class="px-4 py-4 text-right text-xs font-semibold text-slate-400">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="cooperative in cooperatives"
            :key="cooperative.id"
            class="cursor-pointer border-b border-slate-100 bg-white transition-colors duration-200 hover:bg-green-50/40"
          >
            <TableCell class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-xs font-bold text-green-700 shadow-sm"
                >
                  {{ getInitials(cooperative.groupName) }}
                </div>

                <div>
                  <p class="text-sm font-semibold text-slate-800">
                    {{ cooperative.groupName }}
                  </p>

                  <p class="mt-0.5 text-xs font-medium text-slate-400">
                    {{ cooperative.mobilePhone }}
                  </p>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ cooperative.notes || 'No additional notes' }}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
              {{ cooperative.code }}
            </TableCell>

            <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
              {{ cooperative.county }}
            </TableCell>

            <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
              {{ cooperative.mainActivity || 'Not specified' }}
            </TableCell>

            <TableCell class="px-4 py-4">
              <span
                v-if="cooperative.hasInsurance"
                class="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100"
              >
                Insured
              </span>

              <span
                v-else
                class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
              >
                Not insured
              </span>
            </TableCell>

            <TableCell class="px-4 py-4">
              <span
                class="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100"
              >
                {{ cooperative.kraPin || 'Not provided' }}
              </span>
            </TableCell>

            <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
              {{ formatDate(cooperative.createdAt) }}
            </TableCell>

            <TableCell class="px-4 py-4 text-right">
              <Button
                type="button"
                variant="outline"
                class="h-8 cursor-pointer px-3 text-xs font-semibold transition-all hover:border-green-700 hover:bg-green-50 hover:text-green-700 active:scale-95"
                title="Edit cooperative"
                @click.stop="openUpdateModal(cooperative)"
              >
                Edit
              </Button>
            </TableCell>
          </TableRow>

          <TableRow v-if="cooperatives.length === 0">
            <TableCell :colspan="8" class="h-40 text-center text-xs text-slate-500 sm:text-sm">
              No cooperatives found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div
        class="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-xs text-slate-500">Page {{ currentPage }} of {{ totalPages }}</p>

        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            class="h-9 cursor-pointer px-4 text-xs transition-all hover:bg-slate-100 active:scale-95"
            :disabled="!hasPreviousPage"
            title="Previous page"
            @click="previousPage"
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            class="h-9 cursor-pointer px-4 text-xs transition-all hover:bg-slate-100 active:scale-95"
            :disabled="!hasNextPage"
            title="Next page"
            @click="nextPage"
          >
            Next
          </Button>
        </div>
      </div>
    </div>

    <CooperativeModal
      :open="isModalOpen"
      :cooperative="selectedCooperative"
      :is-submitting="isSubmitting"
      @close="closeModal"
      @submit="handleSubmitCooperative"
    />
  </section>
</template>
