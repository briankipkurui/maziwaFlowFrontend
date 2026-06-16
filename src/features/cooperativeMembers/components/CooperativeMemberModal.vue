<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
  BadgeCheck,
  IdCard,
  LoaderCircle,
  MapPin,
  Save,
  Settings2,
  UserRound,
  X,
} from 'lucide-vue-next';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';

import type {
  CooperativeMember,
  CooperativeMemberPayload,
  CooperativeMemberStatus,
} from '../types/cooperativeMember';

const props = withDefaults(
  defineProps<{
    open: boolean;
    member?: CooperativeMember | null;
    isSubmitting?: boolean;
  }>(),
  {
    member: null,
    isSubmitting: false,
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativeMemberPayload];
}>();

const isEditMode = computed(() => Boolean(props.member));

const dialogTitle = computed(() =>
  isEditMode.value ? 'Update Cooperative Member' : 'Create Cooperative Member',
);

const submitLabel = computed(() => (isEditMode.value ? 'Update Member' : 'Create Member'));

const statusOptions: Array<{
  label: string;
  value: CooperativeMemberStatus;
}> = [
  {
    label: 'Active',
    value: 'ACTIVE',
  },
  {
    label: 'Inactive',
    value: 'INACTIVE',
  },
  {
    label: 'Suspended',
    value: 'SUSPENDED',
  },
];

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

  if (!member) {
    return;
  }

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
    if (!open) {
      return;
    }

    populateForm(props.member);
  },
);

watch(
  () => props.member,
  (member) => {
    if (!props.open) {
      return;
    }

    populateForm(member);
  },
);

const handleClose = () => {
  if (props.isSubmitting) {
    return;
  }

  emit('close');
};

const handleVisibilityChange = (visible: boolean) => {
  if (!visible) {
    handleClose();
  }
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
  <Dialog
    :visible="open"
    modal
    dismissable-mask
    :draggable="false"
    :closable="false"
    :close-on-escape="!isSubmitting"
    class="cooperative-member-dialog"
    :style="{ width: 'min(1060px, calc(100vw - 2rem))' }"
    :pt="{
      mask: {
        class: 'cooperative-member-dialog-mask',
      },
    }"
    @update:visible="handleVisibilityChange"
  >
    <!-- Header -->
    <template #header>
      <div class="flex w-full items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold tracking-[-0.02em] text-heading">
            {{ dialogTitle }}
          </h2>

          <p class="mt-1 text-sm leading-6 text-secondary-text">
            Enter the member registration, contact and location details.
          </p>
        </div>

        <Button
          type="button"
          severity="secondary"
          text
          rounded
          aria-label="Close modal"
          class="modal-icon-button shrink-0"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          <X class="h-5 w-5" :stroke-width="2" />
        </Button>
      </div>
    </template>

    <form id="cooperative-member-form" class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Member Registration -->
      <section>
        <div class="mb-4 flex items-start gap-2">
          <IdCard class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Member Registration</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the member registration, role and account status.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="form-field">
            <label for="member-number" class="form-label">
              Member Number
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="member-number"
              v-model="form.memberNumber"
              placeholder="Enter member number"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="identification-number" class="form-label">
              Identification Number
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="identification-number"
              v-model="form.identificationNumber"
              placeholder="Enter ID or passport number"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="joined-at" class="form-label">
              Date Joined
              <span class="text-error">*</span>
            </label>

            <InputText
              id="joined-at"
              v-model="form.joinedAt"
              type="date"
              required
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="member-status" class="form-label">
              Member Status
              <span class="text-error">*</span>
            </label>

            <Select
              id="member-status"
              v-model="form.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Select member status"
              class="form-input"
              append-to="self"
            />
          </div>

          <div class="form-field sm:col-span-2">
            <label for="role-id" class="form-label">
              Role ID
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="role-id"
              v-model="form.roleId"
              placeholder="Enter role ID when assigning a role"
              class="form-input"
            />
          </div>
        </div>
      </section>

      <Divider />

      <!-- Personal Details -->
      <section>
        <div class="mb-4 flex items-start gap-2">
          <UserRound class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Personal Details</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the member name and contact information.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="form-field">
            <label for="first-name" class="form-label">
              First Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="first-name"
              v-model="form.profile.firstName"
              required
              placeholder="Enter first name"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="middle-name" class="form-label">
              Middle Name
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="middle-name"
              v-model="form.profile.middleName"
              placeholder="Enter middle name"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="last-name" class="form-label">
              Last Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="last-name"
              v-model="form.profile.lastName"
              required
              placeholder="Enter last name"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="mobile-number" class="form-label">
              Mobile Number
              <span class="text-error">*</span>
            </label>

            <InputText
              id="mobile-number"
              v-model="form.profile.mobileNumber"
              type="tel"
              required
              placeholder="Enter mobile number"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="other-number" class="form-label">
              Other Number
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="other-number"
              v-model="form.profile.otherNumber"
              type="tel"
              placeholder="Enter alternative number"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="email-address" class="form-label">
              Email Address
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="email-address"
              v-model="form.profile.email"
              type="email"
              placeholder="Enter email address"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="kra-pin" class="form-label">
              KRA PIN
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="kra-pin"
              v-model="form.profile.kraPin"
              placeholder="Enter KRA PIN"
              class="form-input"
            />
          </div>
        </div>
      </section>

      <Divider />

      <!-- Location Details -->
      <section>
        <div class="mb-4 flex items-start gap-2">
          <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Location Details</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the administrative location of the cooperative member.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="form-field">
            <label for="county" class="form-label">
              County
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="county"
              v-model="form.profile.county"
              placeholder="Enter county"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="sub-county" class="form-label">
              Sub County
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="sub-county"
              v-model="form.profile.subCounty"
              placeholder="Enter sub county"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="division" class="form-label">
              Division
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="division"
              v-model="form.profile.division"
              placeholder="Enter division"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="location" class="form-label">
              Location
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="location"
              v-model="form.profile.location"
              placeholder="Enter location"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="sub-location" class="form-label">
              Sub Location
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="sub-location"
              v-model="form.profile.subLocation"
              placeholder="Enter sub location"
              class="form-input"
            />
          </div>
        </div>
      </section>

      <Divider />

      <!-- Account Settings -->
      <section>
        <div class="mb-4 flex items-start gap-2">
          <Settings2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Account Settings</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Control whether the member account is active and verified.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div
            class="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/30 px-4 py-3"
          >
            <div>
              <p class="text-sm font-semibold text-heading">Active Account</p>

              <p class="mt-1 text-xs leading-5 text-secondary-text">
                Allow the member to use their cooperative account.
              </p>
            </div>

            <ToggleSwitch v-model="form.isActive" />
          </div>

          <div
            class="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/30 px-4 py-3"
          >
            <div>
              <p class="text-sm font-semibold text-heading">Verified Details</p>

              <p class="mt-1 text-xs leading-5 text-secondary-text">
                Confirm that the member information has been verified.
              </p>
            </div>

            <ToggleSwitch v-model="form.isVerified" />
          </div>
        </div>
      </section>

      <Divider />

      <!-- Verification Summary -->
      <section>
        <div class="flex items-start gap-2">
          <BadgeCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Before Saving</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Confirm that the member name, mobile number and joining date are accurate before
              submitting the form.
            </p>
          </div>
        </div>
      </section>
    </form>

    <!-- Footer -->
    <template #footer>
      <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          severity="secondary"
          outlined
          class="modal-secondary-button"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          form="cooperative-member-form"
          class="modal-primary-button"
          :disabled="isSubmitting"
        >
          <LoaderCircle v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" :stroke-width="2" />

          <Save v-else class="mr-2 h-4 w-4" :stroke-width="2" />

          {{ isSubmitting ? 'Saving...' : submitLabel }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/*
  PrimeVue renders the dialog outside the component DOM using teleport.
  Global selectors ensure that the theme styles reach the rendered modal.
*/

:global(.cooperative-member-dialog.p-dialog) {
  overflow: hidden;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.875rem !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
  box-shadow: 0 20px 45px rgb(0 0 0 / 18%) !important;
}

:global(.cooperative-member-dialog .p-dialog-header),
:global(.cooperative-member-dialog .p-dialog-content),
:global(.cooperative-member-dialog .p-dialog-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-member-dialog .p-dialog-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.cooperative-member-dialog .p-dialog-content) {
  max-height: min(72vh, 780px);
  overflow-y: auto;
  padding: 1.5rem !important;
}

:global(.cooperative-member-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.cooperative-member-dialog .p-divider.p-divider-horizontal::before) {
  border-top-color: var(--color-border) !important;
}

:global(.cooperative-member-dialog-mask) {
  background-color: rgb(0 0 0 / 52%) !important;
  backdrop-filter: blur(2px);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-label {
  color: var(--color-secondary-text);
  font-size: 0.75rem;
  font-weight: 700;
}

.form-input {
  width: 100%;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.5rem !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
  font-size: 0.875rem !important;
  box-shadow: none !important;
}

.form-input::placeholder {
  color: var(--color-muted-text) !important;
}

.form-input:enabled:hover {
  border-color: var(--color-primary) !important;
}

.form-input:enabled:focus {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent) !important;
}

:global(.cooperative-member-dialog .p-inputtext) {
  padding: 0.7rem 0.8rem !important;
}

/*
  PrimeVue Select.
*/
:global(.cooperative-member-dialog .p-select.form-input) {
  display: flex;
  align-items: center;
  padding: 0 !important;
}

:global(.cooperative-member-dialog .p-select.form-input:hover) {
  border-color: var(--color-primary) !important;
}

:global(.cooperative-member-dialog .p-select.form-input.p-focus) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent) !important;
}

:global(.cooperative-member-dialog .p-select-label) {
  padding: 0.7rem 0.8rem !important;
  color: var(--color-heading) !important;
  font-size: 0.875rem !important;
}

:global(.cooperative-member-dialog .p-select-label.p-placeholder) {
  color: var(--color-muted-text) !important;
}

:global(.cooperative-member-dialog .p-select-dropdown) {
  color: var(--color-secondary-text) !important;
}

/*
  PrimeVue toggle switches.
*/
:global(.cooperative-member-dialog .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background-color: var(--color-primary) !important;
}

:global(.cooperative-member-dialog .p-toggleswitch:not(.p-disabled):hover .p-toggleswitch-slider) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent) !important;
}

/*
  Modal buttons.
*/
:global(.cooperative-member-dialog .modal-icon-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-member-dialog .modal-icon-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-member-dialog .modal-secondary-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-member-dialog .modal-secondary-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-member-dialog .modal-primary-button.p-button) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-member-dialog .modal-primary-button.p-button:hover) {
  border-color: var(--color-primary-hover) !important;
  background-color: var(--color-primary-hover) !important;
}
</style>
