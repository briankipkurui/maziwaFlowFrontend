<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type {
  CooperativeMember,
  CooperativeMemberPayload,
  CooperativeMemberStatus,
} from '../types/cooperativeMember';

const props = defineProps<{
  open: boolean;
  member?: CooperativeMember | null;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativeMemberPayload];
}>();

const isEditMode = computed(() => Boolean(props.member));

const inputClass =
  'h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100';

const selectClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100';

const createEmptyForm = (): CooperativeMemberPayload => ({
  memberNumber: '',
  identificationNumber: '',
  roleId: '',
  status: 'ACTIVE',
  joinedAt: new Date().toISOString().slice(0, 10),
  isActive: true,
  isVerified: false,

  profile: {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    otherNumber: '',
    kraPin: '',
    county: '',
    subCounty: '',
    division: '',
    location: '',
    subLocation: '',
  },
});

const form = reactive<CooperativeMemberPayload>(createEmptyForm());

const resetForm = () => {
  Object.assign(form, createEmptyForm());
};

const populateForm = (member?: CooperativeMember | null) => {
  resetForm();

  if (!member) return;

  Object.assign(form, {
    memberNumber: member.memberNumber ?? '',
    identificationNumber: member.identificationNumber ?? '',
    roleId: member.roleId ?? member.role?.id ?? '',
    status: member.status ?? 'ACTIVE',
    joinedAt: member.joinedAt
      ? member.joinedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    isActive: member.isActive ?? true,
    isVerified: member.isVerified ?? false,

    profile: {
      firstName: member.profile?.firstName ?? '',
      middleName: member.profile?.middleName ?? '',
      lastName: member.profile?.lastName ?? '',
      email: member.profile?.email ?? member.email ?? '',
      mobileNumber: member.profile?.mobileNumber ?? member.mobileNumber ?? '',
      otherNumber: member.profile?.otherNumber ?? '',
      kraPin: member.profile?.kraPin ?? '',
      county: member.profile?.county ?? '',
      subCounty: member.profile?.subCounty ?? '',
      division: member.profile?.division ?? '',
      location: member.profile?.location ?? '',
      subLocation: member.profile?.subLocation ?? '',
    },
  });
};

watch(
  () => props.open,
  (open) => {
    if (!open) return;

    populateForm(props.member);
  },
);

watch(
  () => props.member,
  (member) => {
    if (!props.open) return;

    populateForm(member);
  },
);

const handleClose = () => {
  emit('close');
};

const handleSubmit = () => {
  emit('submit', {
    memberNumber: form.memberNumber?.trim() || undefined,
    identificationNumber: form.identificationNumber?.trim() || undefined,
    roleId: form.roleId?.trim() || undefined,
    status: form.status as CooperativeMemberStatus,
    joinedAt: form.joinedAt,
    isActive: form.isActive,
    isVerified: form.isVerified,

    profile: {
      firstName: form.profile.firstName.trim(),
      middleName: form.profile.middleName?.trim() || undefined,
      lastName: form.profile.lastName.trim(),
      email: form.profile.email?.trim() || undefined,
      mobileNumber: form.profile.mobileNumber.trim(),
      otherNumber: form.profile.otherNumber?.trim() || undefined,
      kraPin: form.profile.kraPin?.trim() || undefined,
      county: form.profile.county?.trim() || undefined,
      subCounty: form.profile.subCounty?.trim() || undefined,
      division: form.profile.division?.trim() || undefined,
      location: form.profile.location?.trim() || undefined,
      subLocation: form.profile.subLocation?.trim() || undefined,
    },
  });
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <Transition name="scale">
          <div
            v-if="open"
            class="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div class="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  {{ isEditMode ? 'Update Cooperative Member' : 'Create Cooperative Member' }}
                </h2>

                <p class="mt-1 text-sm text-slate-500">
                  Enter the member's registration, contact and location details.
                </p>
              </div>

              <button
                type="button"
                class="rounded-full px-3 py-1 text-xl font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
                @click="handleClose"
              >
                ×
              </button>
            </div>

            <form class="grid gap-6" @submit.prevent="handleSubmit">
              <section>
                <h3 class="mb-3 text-sm font-bold text-slate-800">Member Registration</h3>

                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Member Number
                    </label>

                    <Input
                      v-model="form.memberNumber"
                      :class="inputClass"
                      placeholder="Enter member number"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Identification Number
                    </label>

                    <Input
                      v-model="form.identificationNumber"
                      :class="inputClass"
                      placeholder="Enter ID or passport number"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Date Joined
                    </label>

                    <Input v-model="form.joinedAt" type="date" :class="inputClass" required />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Member Status
                    </label>

                    <select v-model="form.status" :class="selectClass">
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>

                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Role ID
                      <span class="normal-case tracking-normal text-slate-400"> (Optional) </span>
                    </label>

                    <Input
                      v-model="form.roleId"
                      :class="inputClass"
                      placeholder="Enter role ID when assigning a role"
                    />
                  </div>
                </div>
              </section>

              <section class="border-t border-slate-100 pt-5">
                <h3 class="mb-3 text-sm font-bold text-slate-800">Personal Details</h3>

                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      First Name
                    </label>

                    <Input
                      v-model="form.profile.firstName"
                      :class="inputClass"
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Middle Name
                    </label>

                    <Input
                      v-model="form.profile.middleName"
                      :class="inputClass"
                      placeholder="Enter middle name"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Last Name
                    </label>

                    <Input
                      v-model="form.profile.lastName"
                      :class="inputClass"
                      placeholder="Enter last name"
                      required
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Mobile Number
                    </label>

                    <Input
                      v-model="form.profile.mobileNumber"
                      type="tel"
                      :class="inputClass"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Other Number
                    </label>

                    <Input
                      v-model="form.profile.otherNumber"
                      type="tel"
                      :class="inputClass"
                      placeholder="Enter alternative number"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Email Address
                    </label>

                    <Input
                      v-model="form.profile.email"
                      type="email"
                      :class="inputClass"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      KRA PIN
                    </label>

                    <Input
                      v-model="form.profile.kraPin"
                      :class="inputClass"
                      placeholder="Enter KRA PIN"
                    />
                  </div>
                </div>
              </section>

              <section class="border-t border-slate-100 pt-5">
                <h3 class="mb-3 text-sm font-bold text-slate-800">Location Details</h3>

                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      County
                    </label>

                    <Input
                      v-model="form.profile.county"
                      :class="inputClass"
                      placeholder="Enter county"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Sub County
                    </label>

                    <Input
                      v-model="form.profile.subCounty"
                      :class="inputClass"
                      placeholder="Enter sub county"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Division
                    </label>

                    <Input
                      v-model="form.profile.division"
                      :class="inputClass"
                      placeholder="Enter division"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Location
                    </label>

                    <Input
                      v-model="form.profile.location"
                      :class="inputClass"
                      placeholder="Enter location"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Sub Location
                    </label>

                    <Input
                      v-model="form.profile.subLocation"
                      :class="inputClass"
                      placeholder="Enter sub location"
                    />
                  </div>
                </div>
              </section>

              <section class="border-t border-slate-100 pt-5">
                <h3 class="mb-3 text-sm font-bold text-slate-800">Account Settings</h3>

                <div class="grid gap-3 sm:grid-cols-2">
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <input
                      v-model="form.isActive"
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 accent-green-700"
                    />

                    <span class="text-sm font-medium text-slate-700">
                      Member account is active
                    </span>
                  </label>

                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <input
                      v-model="form.isVerified"
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 accent-green-700"
                    />

                    <span class="text-sm font-medium text-slate-700">
                      Member details are verified
                    </span>
                  </label>
                </div>
              </section>

              <div class="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  class="h-10 rounded-xl border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  :disabled="isSubmitting"
                  @click="handleClose"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  class="h-10 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Saving...' : isEditMode ? 'Update Member' : 'Create Member' }}
                </Button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
