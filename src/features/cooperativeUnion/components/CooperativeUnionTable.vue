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

const handleSearch = () => {
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
  <section class="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 md:px-7 lg:px-8">
    <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Cooperative Unions
        </h1>

        <p class="mt-1 text-xs text-slate-500 sm:text-sm">
          Manage cooperative unions and their registration details.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative w-full sm:w-72 md:w-80">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"> 🔍 </span>

          <Input
            v-model="search"
            type="text"
            placeholder="Search cooperative unions"
            class="h-10 rounded-full border-slate-300 bg-white pl-9 text-xs shadow-sm focus-visible:ring-green-600 sm:text-sm"
            @keyup.enter="handleSearch"
          />
        </div>

        <Button
          type="button"
          class="cursor-pointer h-10 rounded-md bg-green-700 px-5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:bg-green-800 hover:shadow-lg active:scale-95 sm:text-xs"
          @click="openCreateModal"
          title="Create new cooperative union"
        >
          ➕ Create Union
        </Button>
      </div>
    </div>

    <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
      <p class="text-xs font-medium text-slate-500 sm:text-sm">Total: {{ totalItems }} union(s)</p>

      <Button
        type="button"
        class="cursor-pointer text-base text-slate-500 transition-all hover:text-green-700 hover:scale-110 active:scale-95 sm:text-lg"
        title="Refresh cooperative unions"
        @click="refetch"
      >
        ⟳
      </Button>
    </div>

    <div
      v-if="isLoading"
      class="flex min-h-[250px] items-center justify-center bg-white text-xs text-slate-500 shadow-sm sm:text-sm"
    >
      Loading cooperative unions...
    </div>

    <div
      v-else-if="isError"
      class="rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700 sm:text-sm"
    >
      {{ error?.message || 'Failed to load cooperative unions.' }}
    </div>

    <div v-else class="overflow-x-auto bg-white shadow-sm">
      <Table class="min-w-[1100px]">
        <TableHeader>
          <TableRow class="border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
            <TableHead class="w-[28%] px-4 py-4 text-xs font-semibold text-slate-400">
              Union Information
            </TableHead>

            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">County</TableHead>
            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">Ward</TableHead>
            <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">KRA PIN</TableHead>

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
            v-for="union in cooperativeUnions"
            :key="union.id"
            class="border-b border-slate-100 bg-white cursor-pointer transition-colors duration-200 hover:bg-green-50/40"
          >
            <TableCell class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-xs font-bold text-green-700 shadow-sm"
                >
                  {{ union.name.charAt(0) }}
                </div>

                <div>
                  <p class="text-sm font-semibold text-slate-800">
                    {{ union.name }}
                  </p>

                  <p class="mt-0.5 text-xs font-medium text-slate-400">ID: {{ union.id }}</p>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ union.description || 'No description' }}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
              {{ union.county }}
            </TableCell>

            <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
              {{ union.ward }}
            </TableCell>

            <TableCell class="px-4 py-4">
              <span
                class="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100"
              >
                {{ union.kraPin }}
              </span>
            </TableCell>

            <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
              {{ formatDate(union.createdAt) }}
            </TableCell>

            <TableCell class="px-4 py-4 text-right">
              <button
                type="button"
                class="cursor-pointer rounded-full px-3 py-1 text-lg font-bold leading-none text-slate-400 transition-all duration-200 hover:bg-green-50 hover:text-green-700 hover:scale-110 active:scale-95"
                @click="openUpdateModal(union)"
                title="Edit union"
              >
                ✏️
              </button>
            </TableCell>
          </TableRow>

          <TableRow v-if="cooperativeUnions.length === 0">
            <TableCell :colspan="6" class="h-40 text-center text-xs text-slate-500 sm:text-sm">
              No cooperative unions found.
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
            class="h-9 px-4 text-xs cursor-pointer transition-all hover:bg-slate-100 active:scale-95"
            :disabled="!hasPreviousPage"
            @click="previousPage"
            title="Previous page"
          >
            ← Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            class="h-9 px-4 text-xs cursor-pointer transition-all hover:bg-slate-100 active:scale-95"
            :disabled="!hasNextPage"
            @click="nextPage"
            title="Next page"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>

    <CooperativeUnionModal
      :open="isModalOpen"
      :union="selectedUnion"
      :is-submitting="createMutation.isPending.value || updateMutation.isPending.value"
      @close="closeModal"
      @submit="handleSubmitUnion"
    />
  </section>
</template>
