<script setup lang="ts">
import { computed } from 'vue';

import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-vue-next';

import DataTable from 'primevue/datatable';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;

    searchValue: string;
    searchPlaceholder: string;

    createLabel: string;
    itemLabel: string;

    rows: object[];
    totalItems: number;

    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;

    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;

    dataKey?: string;
    wide?: boolean;
  }>(),
  {
    errorMessage: 'Failed to load records.',
    dataKey: 'id',
    wide: false,
  },
);

const emit = defineEmits<{
  'update:searchValue': [value: string];
  search: [];
  clear: [];
  refresh: [];
  create: [];
  previous: [];
  next: [];
}>();

const searchModel = computed({
  get: () => props.searchValue,
  set: (value: string) => emit('update:searchValue', value),
});

const tableStyle = computed(() => ({
  minWidth: props.wide ? '1300px' : '1050px',
}));
</script>

<template>
  <section class="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
    <!-- Heading and Main Actions -->
    <div class="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 class="text-[26px] font-bold tracking-[-0.02em] text-heading">
          {{ title }}
        </h1>

        <p class="mt-1.5 text-sm font-normal text-secondary-text">
          {{ description }}
        </p>
      </div>

      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <!-- Search -->
        <form
          class="flex w-full flex-col gap-2 sm:flex-row md:w-auto"
          @submit.prevent="emit('search')"
        >
          <div class="relative w-full sm:w-80 lg:w-96">
            <Search
              class="absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-muted-text"
              :stroke-width="2"
            />

            <Input
              v-model="searchModel"
              type="text"
              :placeholder="searchPlaceholder"
              class="h-11 w-full rounded-lg border-border bg-card pl-11 pr-3 text-sm font-normal text-heading shadow-none placeholder:text-muted-text focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            class="h-11 cursor-pointer rounded-lg border-border bg-card px-5 text-sm font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            Search
          </Button>

          <Button
            v-if="searchValue"
            type="button"
            variant="outline"
            class="h-11 w-11 cursor-pointer rounded-lg border-border bg-card p-0 text-secondary-text shadow-none transition-colors hover:border-error hover:bg-error/10 hover:text-error"
            title="Clear search"
            @click="emit('clear')"
          >
            <X class="h-4 w-4" :stroke-width="2" />
          </Button>
        </form>

        <!-- Create -->
        <Button
          type="button"
          class="h-11 cursor-pointer gap-2 rounded-lg bg-primary px-5 text-xs font-bold uppercase tracking-[0.04em] text-primary-foreground shadow-none transition-colors hover:bg-primary-hover"
          @click="emit('create')"
        >
          <Plus class="h-4 w-4" :stroke-width="2.5" />

          {{ createLabel }}
        </Button>
      </div>
    </div>

    <!-- Summary and Refresh -->
    <div class="mb-4 flex items-center justify-between gap-3">
      <span
        class="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
      >
        {{ totalItems }} {{ itemLabel }}
      </span>

      <Button
        type="button"
        variant="outline"
        class="h-10 cursor-pointer gap-2 rounded-lg border-border bg-card px-3.5 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
        title="Refresh records"
        @click="emit('refresh')"
      >
        <RefreshCw class="h-4 w-4" :stroke-width="2" />

        <span>Refresh</span>
      </Button>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm text-muted-text"
    >
      <LoaderCircle class="h-6 w-6 animate-spin text-primary" :stroke-width="2" />

      Loading records...
    </div>

    <!-- Error -->
    <div
      v-else-if="isError"
      class="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error"
    >
      {{ errorMessage }}
    </div>

    <!-- PrimeVue Table -->
    <div v-else class="overflow-hidden rounded-xl border border-border bg-card shadow-none">
      <div class="overflow-x-auto bg-card">
        <DataTable
          :value="rows"
          :data-key="dataKey"
          :table-style="tableStyle"
          row-hover
          class="entity-table"
        >
          <slot name="columns" />

          <template #empty>
            <div class="flex h-44 items-center justify-center text-sm text-muted-text">
              <slot name="empty">No records found.</slot>
            </div>
          </template>
        </DataTable>
      </div>

      <!-- Pagination -->
      <div
        class="flex flex-col gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-xs font-medium text-secondary-text">
          Page {{ currentPage }} of {{ totalPages }}
        </p>

        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            class="h-9 cursor-pointer gap-1 rounded-lg border-border bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!hasPreviousPage"
            @click="emit('previous')"
          >
            <ChevronLeft class="h-4 w-4" :stroke-width="2" />

            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            class="h-9 cursor-pointer gap-1 rounded-lg border-border bg-card px-3 text-xs font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!hasNextPage"
            @click="emit('next')"
          >
            Next

            <ChevronRight class="h-4 w-4" :stroke-width="2" />
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
  Keep the PrimeVue table aligned with your application theme:
  dark mode = #151515
  light mode = #ffffff
*/
.entity-table {
  background-color: var(--color-card) !important;
}

.entity-table :deep(.p-datatable-table),
.entity-table :deep(.p-datatable-thead),
.entity-table :deep(.p-datatable-tbody),
.entity-table :deep(.p-datatable-thead > tr),
.entity-table :deep(.p-datatable-tbody > tr),
.entity-table :deep(.p-datatable-thead > tr > th),
.entity-table :deep(.p-datatable-tbody > tr > td),
.entity-table :deep(.p-datatable-empty-message),
.entity-table :deep(.p-datatable-empty-message > td) {
  background-color: var(--color-card) !important;
}

/*
  Column headings.
*/
.entity-table :deep(.p-datatable-thead > tr > th) {
  border: 0 !important;
  border-bottom: 1px solid var(--color-border) !important;
  padding: 0.95rem 1rem !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
  white-space: nowrap;
}

/*
  Table records.
*/
.entity-table :deep(.p-datatable-tbody > tr > td) {
  border: 0 !important;
  padding: 1rem !important;
  color: var(--color-heading) !important;
  font-size: 0.875rem !important;
  vertical-align: middle;
}

/*
  Subtle divider between records.
*/
.entity-table :deep(.p-datatable-tbody > tr + tr > td) {
  border-top: 1px solid var(--color-border) !important;
}

/*
  Apply a subtle branded hover state.
*/
.entity-table :deep(.p-datatable-tbody > tr:hover > td) {
  background-color: color-mix(in srgb, var(--color-primary) 4%, var(--color-card)) !important;
}

/*
  Remove the default PrimeVue outline when a row is clicked.
*/
.entity-table :deep(.p-datatable-tbody > tr:focus) {
  outline: none !important;
}

/*
  Empty state.
*/
.entity-table :deep(.p-datatable-empty-message > td) {
  border: 0 !important;
  padding: 0 !important;
}
</style>
