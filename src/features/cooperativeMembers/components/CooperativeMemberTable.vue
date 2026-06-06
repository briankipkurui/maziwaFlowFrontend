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
import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative.ts';

const searchInput = ref('');
const appliedSearch = ref('');
const page = ref(1);
const pageSize = ref(10);

const isModalOpen = ref(false);

const selectedMember = ref<CooperativeMember | null>(null);

const { activeCooperativeId, activeCooperative } = useActiveCooperative();

const queryParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: appliedSearch.value || undefined,
}));

const { data, isLoading, isFetching, isError, error, refetch } =
  useCooperativeMembersQuery(queryParams);

const createMutation = useCreateCooperativeMemberMutation();

const updateMutation = useUpdateCooperativeMemberMutation();

const deleteMutation = useDeleteCooperativeMemberMutation();

const members = computed(() => data.value?.results ?? []);

const totalItems = computed(() => data.value?.totalItems ?? 0);

const totalPages = computed(() => data.value?.totalPages ?? 1);

const currentPage = computed(() => data.value?.currentPage ?? page.value);

const hasNextPage = computed(() => data.value?.hasNextPage ?? false);

const hasPreviousPage = computed(() => data.value?.hasPreviousPage ?? false);

const isSubmitting = computed(
  () => createMutation.isPending.value || updateMutation.isPending.value,
);

const deletingMemberId = ref<string | null>(null);

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  return 'Failed to load cooperative members.';
});

const getFullName = (member: CooperativeMember): string => {
  return [member.profile?.firstName, member.profile?.middleName, member.profile?.lastName]
    .filter(Boolean)
    .join(' ');
};

const getInitials = (member: CooperativeMember): string => {
  return [member.profile?.firstName, member.profile?.lastName]
    .filter(Boolean)
    .map((name) => name?.charAt(0).toUpperCase())
    .join('');
};

const getStatusClass = (status: CooperativeMemberStatus): string => {
  if (status === 'ACTIVE') {
    return 'bg-green-50 text-green-700 ring-green-100';
  }

  if (status === 'SUSPENDED') {
    return 'bg-amber-50 text-amber-700 ring-amber-100';
  }

  return 'bg-slate-100 text-slate-600 ring-slate-200';
};

const formatDate = (date?: string): string => {
  if (!date) return 'Not provided';

  return new Date(date).toLocaleDateString('en-KE', {
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
  if (!hasNextPage.value) return;

  page.value += 1;
};

const previousPage = () => {
  if (!hasPreviousPage.value) return;

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
  if (selectedMember.value) {
    await updateMutation.mutateAsync({
      id: selectedMember.value.id,
      payload,
    });
  } else {
    await createMutation.mutateAsync(payload);
  }

  closeModal();
};

const handleDeleteMember = async (member: CooperativeMember) => {
  const memberName = getFullName(member);

  const shouldDelete = window.confirm(`Are you sure you want to delete ${memberName}?`);

  if (!shouldDelete) return;

  deletingMemberId.value = member.id;

  try {
    await deleteMutation.mutateAsync(member.id);
  } finally {
    deletingMemberId.value = null;
  }
};
</script>

<template>
  <section class="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 md:px-7 lg:px-8">
    <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Cooperative Members
        </h1>

        <p class="mt-1 text-xs text-slate-500 sm:text-sm">
          Manage members registered under
          <span class="font-semibold text-slate-700">
            {{
              activeCooperative?.cooperative.groupName ??
              activeCooperative?.cooperative.groupName ??
              'the logged-in cooperative'
            }}
          </span>
          .
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form class="flex w-full gap-2 sm:w-auto" @submit.prevent="handleSearch">
          <Input
            v-model="searchInput"
            type="text"
            placeholder="Search members"
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
          :disabled="!activeCooperativeId"
          @click="openCreateModal"
        >
          Create Member
        </Button>
      </div>
    </div>

    <div
      v-if="!activeCooperativeId"
      class="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
    >
      No cooperative is linked to your logged-in account. Please log in again or contact the system
      administrator.
    </div>

    <template v-else>
      <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
        <p class="text-xs font-medium text-slate-500 sm:text-sm">
          Total: {{ totalItems }} member(s)
        </p>

        <Button
          type="button"
          variant="outline"
          class="h-9 cursor-pointer px-4 text-xs font-semibold transition-all hover:bg-slate-100 active:scale-95"
          :disabled="isFetching"
          @click="refetch"
        >
          {{ isFetching ? 'Refreshing...' : 'Refresh' }}
        </Button>
      </div>

      <div
        v-if="isLoading"
        class="flex min-h-[250px] items-center justify-center bg-white text-xs text-slate-500 shadow-sm sm:text-sm"
      >
        Loading cooperative members...
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
              <TableHead class="w-[27%] px-4 py-4 text-xs font-semibold text-slate-400">
                Member Information
              </TableHead>

              <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">
                Member Number
              </TableHead>

              <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">
                Identification
              </TableHead>

              <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400">
                Location
              </TableHead>

              <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400"> Role </TableHead>

              <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400"> Status </TableHead>

              <TableHead class="px-4 py-4 text-xs font-semibold text-slate-400"> Joined </TableHead>

              <TableHead class="px-4 py-4 text-right text-xs font-semibold text-slate-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow
              v-for="member in members"
              :key="member.id"
              class="border-b border-slate-100 bg-white transition-colors duration-200 hover:bg-green-50/40"
            >
              <TableCell class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-xs font-bold text-green-700 shadow-sm"
                  >
                    {{ getInitials(member) }}
                  </div>

                  <div>
                    <p class="text-sm font-semibold text-slate-800">
                      {{ getFullName(member) }}
                    </p>

                    <p class="mt-0.5 text-xs font-medium text-slate-400">
                      {{
                        member.profile?.mobileNumber || member.mobileNumber || 'No mobile number'
                      }}
                    </p>

                    <p class="mt-1 text-xs text-slate-500">
                      {{ member.profile?.email || member.email || 'No email address' }}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
                {{ member.memberNumber || 'Not assigned' }}
              </TableCell>

              <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
                {{ member.identificationNumber || 'Not provided' }}
              </TableCell>

              <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
                {{ member.profile?.county || member.profile?.location || 'Not provided' }}
              </TableCell>

              <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
                {{ member.role?.name || 'Standard Member' }}
              </TableCell>

              <TableCell class="px-4 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                  :class="getStatusClass(member.status)"
                >
                  {{ member.status }}
                </span>
              </TableCell>

              <TableCell class="px-4 py-4 text-sm font-medium text-slate-600">
                {{ formatDate(member.joinedAt) }}
              </TableCell>

              <TableCell class="px-4 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    class="h-8 cursor-pointer px-3 text-xs font-semibold transition-all hover:border-green-700 hover:bg-green-50 hover:text-green-700 active:scale-95"
                    @click="openUpdateModal(member)"
                  >
                    Edit
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    class="h-8 cursor-pointer px-3 text-xs font-semibold text-red-600 transition-all hover:border-red-600 hover:bg-red-50 hover:text-red-700 active:scale-95"
                    :disabled="deletingMemberId === member.id"
                    @click="handleDeleteMember(member)"
                  >
                    {{ deletingMemberId === member.id ? 'Deleting...' : 'Delete' }}
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            <TableRow v-if="members.length === 0">
              <TableCell :colspan="8" class="h-40 text-center text-xs text-slate-500 sm:text-sm">
                No cooperative members found.
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
              @click="previousPage"
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              class="h-9 cursor-pointer px-4 text-xs transition-all hover:bg-slate-100 active:scale-95"
              :disabled="!hasNextPage"
              @click="nextPage"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </template>

    <CooperativeMemberModal
      :open="isModalOpen"
      :member="selectedMember"
      :is-submitting="isSubmitting"
      @close="closeModal"
      @submit="handleSubmitMember"
    />
  </section>
</template>
