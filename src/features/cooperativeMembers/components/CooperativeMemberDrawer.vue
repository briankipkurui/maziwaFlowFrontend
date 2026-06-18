<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { BadgeCheck, IdCard, LoaderCircle, MapPin, Save, UserRound, X } from 'lucide-vue-next';

import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

import { useActiveCooperative } from '@/composables/cooperative/useActiveCooperative';
import { useCooperativeMemberRolesQuery } from '@/features/cooperativesMemberRoles/composables/queries/cooperativeMemberRoleQueries';

import type {
  CooperativeMember,
  CooperativeMemberPayload,
  CooperativeMemberStatus,
} from '../types/cooperativeMember';

import type { CooperativeMemberRoleListParams } from '@/features/cooperativesMemberRoles/types/cooperativeMemberRoleTypes';
import type { FieldErrors } from '@/utils/formErrors';

const { requireActiveCooperativeId } = useActiveCooperative();

const props = withDefaults(
  defineProps<{
    open: boolean;
    member?: CooperativeMember | null;
    isSubmitting?: boolean;
    serverErrors?: FieldErrors;
    generalError?: string;
  }>(),
  {
    member: null,
    isSubmitting: false,
    serverErrors: () => ({}),
    generalError: '',
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativeMemberPayload];
}>();

type CooperativeMemberForm = CooperativeMemberPayload & {
  password: string;
  profile: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    mobileNumber: string;
    otherNumber?: string;
    kraPin?: string;
    county?: string;
    subCounty?: string;
    division?: string;
    location?: string;
    subLocation?: string;
  };
};

const currentStep = ref(0);

const steps = [
  {
    label: 'Registration',
    description: 'Role, status and password',
  },
  {
    label: 'Personal Details',
    description: 'Name and contact details',
  },
  {
    label: 'Location',
    description: 'Administrative location',
  },
  {
    label: 'Review',
    description: 'Confirm and save',
  },
];

const stepErrorFields = [
  ['memberNumber', 'identificationNumber', 'status', 'password', 'roleId', 'cooperativeId'],
  [
    'profile.firstName',
    'firstName',
    'profile.middleName',
    'middleName',
    'profile.lastName',
    'lastName',
    'profile.mobileNumber',
    'mobileNumber',
    'profile.otherNumber',
    'otherNumber',
    'profile.email',
    'email',
    'profile.kraPin',
    'kraPin',
  ],
  [
    'profile.county',
    'county',
    'profile.subCounty',
    'subCounty',
    'profile.division',
    'division',
    'profile.location',
    'location',
    'profile.subLocation',
    'subLocation',
  ],
  ['general'],
];

const isEditMode = computed(() => Boolean(props.member));

const isFirstStep = computed(() => currentStep.value === 0);

const isLastStep = computed(() => currentStep.value === steps.length - 1);

const drawerTitle = computed(() =>
  isEditMode.value ? 'Update Cooperative Member' : 'Create Cooperative Member',
);

const submitLabel = computed(() => (isEditMode.value ? 'Update Member' : 'Create Member'));

const currentStepLabel = computed(() => steps[currentStep.value]?.label ?? 'Registration');

const roleQueryParams = computed(
  (): CooperativeMemberRoleListParams => ({
    page: 1,
    pageSize: 100,
    search: undefined,
  }),
);

const { data: rolesData, isLoading: isLoadingRoles } =
  useCooperativeMemberRolesQuery(roleQueryParams);

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

const createEmptyForm = (): CooperativeMemberForm => ({
  cooperativeId: '',
  memberNumber: '',
  identificationNumber: '',
  roleId: '',
  password: '',
  status: 'ACTIVE',

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

const form = reactive<CooperativeMemberForm>(createEmptyForm());

const resetForm = () => {
  Object.assign(form, createEmptyForm());
};

const getFieldError = (...fields: string[]): string => {
  for (const field of fields) {
    const error = props.serverErrors?.[field];

    if (error) {
      return error;
    }
  }

  return '';
};

const hasFieldError = (...fields: string[]): boolean => {
  return Boolean(getFieldError(...fields));
};

const hasStepErrors = (stepIndex: number): boolean => {
  return stepErrorFields[stepIndex]?.some((field) => Boolean(props.serverErrors?.[field])) ?? false;
};

const goToStep = (stepIndex: number) => {
  if (props.isSubmitting) {
    return;
  }

  currentStep.value = stepIndex;
};

const goToNextStep = () => {
  if (currentStep.value >= steps.length - 1) {
    return;
  }

  currentStep.value += 1;
};

const goToPreviousStep = () => {
  if (currentStep.value <= 0) {
    return;
  }

  currentStep.value -= 1;
};

const getMemberRoleId = (member?: CooperativeMember | null): string => {
  if (!member) {
    return '';
  }

  const rawMember = member as unknown as {
    roleId?: string | null;
    cooperativeMemberRoleId?: string | null;
    cooperativeRoleId?: string | null;
    role?: {
      id?: string | null;
      roleId?: string | null;
      cooperativeMemberRoleId?: string | null;
      cooperativeRoleId?: string | null;
      name?: string | null;
      description?: string | null;
    } | null;
  };

  return (
    rawMember.roleId ??
    rawMember.cooperativeMemberRoleId ??
    rawMember.cooperativeRoleId ??
    rawMember.role?.id ??
    rawMember.role?.roleId ??
    rawMember.role?.cooperativeMemberRoleId ??
    rawMember.role?.cooperativeRoleId ??
    ''
  );
};

const getMemberRoleName = (member?: CooperativeMember | null): string => {
  if (!member) {
    return 'No role assigned';
  }

  const rawMember = member as unknown as {
    role?: {
      name?: string | null;
    } | null;
  };

  return rawMember.role?.name ?? 'No role assigned';
};

const getMemberRoleDescription = (member?: CooperativeMember | null): string | null => {
  if (!member) {
    return null;
  }

  const rawMember = member as unknown as {
    role?: {
      description?: string | null;
    } | null;
  };

  return rawMember.role?.description ?? null;
};

const populateForm = (member?: CooperativeMember | null) => {
  resetForm();

  const activeCooperativeId = requireActiveCooperativeId();

  if (!member) {
    Object.assign(form, {
      cooperativeId: activeCooperativeId,
    });

    return;
  }

  Object.assign(form, {
    cooperativeId: member.cooperativeId ?? activeCooperativeId,
    memberNumber: member.memberNumber ?? '',
    identificationNumber: member.identificationNumber ?? '',
    roleId: getMemberRoleId(member),
    status: member.status ?? 'ACTIVE',
    password: '',

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

const roleOptions = computed(() => {
  const options = new Map<
    string,
    {
      label: string;
      value: string;
      description?: string | null;
    }
  >();

  for (const role of rolesData.value?.results ?? []) {
    options.set(role.id, {
      label: role.name,
      value: role.id,
      description: role.description,
    });
  }

  const currentRoleId = getMemberRoleId(props.member);
  const currentRoleName = getMemberRoleName(props.member);
  const currentRoleDescription = getMemberRoleDescription(props.member);

  if (currentRoleId) {
    options.set(currentRoleId, {
      label: currentRoleName,
      value: currentRoleId,
      description: currentRoleDescription,
    });
  }

  return Array.from(options.values());
});

const currentRoleName = computed(() => {
  const selectedRoleId = form.roleId;

  if (!selectedRoleId) {
    return getMemberRoleName(props.member);
  }

  const selectedRole = roleOptions.value.find((role) => role.value === selectedRoleId);

  return selectedRole?.label ?? getMemberRoleName(props.member);
});

const fullNamePreview = computed(() => {
  const fullName = [form.profile.firstName, form.profile.middleName, form.profile.lastName]
    .filter(Boolean)
    .join(' ');

  return fullName || 'Not provided';
});

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return;
    }

    currentStep.value = 0;
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

watch(
  () => props.serverErrors,
  (errors) => {
    if (!props.open || !errors) {
      return;
    }

    const errorKeys = Object.keys(errors);

    if (!errorKeys.length) {
      return;
    }

    const firstStepWithError = stepErrorFields.findIndex((fields) =>
      fields.some((field) => errorKeys.includes(field)),
    );

    if (firstStepWithError >= 0) {
      currentStep.value = firstStepWithError;
    }
  },
  {
    deep: true,
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
  const payload = {
    memberNumber: form.memberNumber?.trim() || undefined,
    identificationNumber: form.identificationNumber?.trim() || undefined,
    roleId: form.roleId?.trim() || undefined,
    status: form.status as CooperativeMemberStatus,

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
  } as CooperativeMemberPayload & {
    password?: string;
    cooperativeId?: string;
  };

  if (!isEditMode.value) {
    payload.cooperativeId = requireActiveCooperativeId();
  }

  const password = form.password?.trim();

  if (password) {
    payload.password = password;
  }

  emit('submit', payload);
};
</script>

<template>
  <Drawer
    :visible="open"
    position="right"
    modal
    block-scroll
    :dismissable="!isSubmitting"
    :show-close-icon="false"
    class="cooperative-member-drawer"
    :style="{ width: 'min(760px, 100vw)' }"
    :pt="{
      mask: {
        class: 'cooperative-member-drawer-mask',
      },
    }"
    @update:visible="handleVisibilityChange"
  >
    <template #header>
      <div class="flex w-full items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold tracking-[-0.02em] text-heading">
            {{ drawerTitle }}
          </h2>

          <p class="mt-1 text-sm leading-6 text-secondary-text">
            Step {{ currentStep + 1 }} of {{ steps.length }}:
            <span class="font-semibold text-heading">{{ currentStepLabel }}</span>
          </p>
        </div>

        <Button
          type="button"
          severity="secondary"
          text
          rounded
          aria-label="Close drawer"
          class="drawer-icon-button shrink-0"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          <X class="h-5 w-5" :stroke-width="2" />
        </Button>
      </div>
    </template>

    <div class="mb-5 grid gap-2 sm:grid-cols-4">
      <button
        v-for="(step, index) in steps"
        :key="step.label"
        type="button"
        class="step-button"
        :class="{
          'step-button-active': currentStep === index,
          'step-button-error': hasStepErrors(index),
        }"
        @click="goToStep(index)"
      >
        <span class="step-number">
          {{ index + 1 }}
        </span>

        <span class="min-w-0">
          <span class="block truncate text-xs font-bold">
            {{ step.label }}
          </span>

          <span class="mt-0.5 block truncate text-[11px] font-medium opacity-80">
            {{ step.description }}
          </span>
        </span>
      </button>
    </div>

    <div
      v-if="generalError || getFieldError('general')"
      class="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm font-semibold text-error"
    >
      {{ generalError || getFieldError('general') }}
    </div>

    <form id="cooperative-member-drawer-form" class="space-y-6" @submit.prevent="handleSubmit">
      <section v-if="currentStep === 0">
        <div class="mb-4 flex items-start gap-2">
          <IdCard class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Member Registration</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the member number, status, password and role.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="drawer-member-number" class="form-label">
              Member Number
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-member-number"
              v-model="form.memberNumber"
              placeholder="Enter member number"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('memberNumber') }"
            />

            <p v-if="hasFieldError('memberNumber')" class="form-error">
              {{ getFieldError('memberNumber') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-identification-number" class="form-label">
              Identification Number
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-identification-number"
              v-model="form.identificationNumber"
              placeholder="Enter ID or passport number"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('identificationNumber') }"
            />

            <p v-if="hasFieldError('identificationNumber')" class="form-error">
              {{ getFieldError('identificationNumber') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-member-status" class="form-label">
              Member Status
              <span class="text-error">*</span>
            </label>

            <Select
              id="drawer-member-status"
              v-model="form.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Select member status"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('status') }"
              append-to="self"
            />

            <p v-if="hasFieldError('status')" class="form-error">
              {{ getFieldError('status') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-password" class="form-label">
              Password
              <span v-if="!isEditMode" class="text-error">*</span>
              <span v-else class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-password"
              v-model="form.password"
              type="password"
              :required="!isEditMode"
              placeholder="Enter member password"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('password') }"
            />

            <p v-if="hasFieldError('password')" class="form-error">
              {{ getFieldError('password') }}
            </p>
          </div>

          <div class="form-field sm:col-span-2">
            <label for="drawer-role-id" class="form-label">
              Member Role
              <span class="text-muted-text">(Optional)</span>
            </label>

            <Select
              id="drawer-role-id"
              v-model="form.roleId"
              :options="roleOptions"
              option-label="label"
              option-value="value"
              filter
              show-clear
              :loading="isLoadingRoles"
              :disabled="isSubmitting || isLoadingRoles"
              placeholder="Select member role"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('roleId') }"
              append-to="self"
            >
              <template #option="{ option }">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-heading">
                    {{ option.label }}
                  </p>

                  <p class="mt-0.5 text-xs text-secondary-text">
                    {{ option.description || 'No description provided' }}
                  </p>
                </div>
              </template>
            </Select>

            <p class="text-xs leading-5 text-secondary-text">
              Current role:
              <span class="font-semibold text-heading">
                {{ currentRoleName }}
              </span>
            </p>

            <p v-if="hasFieldError('roleId')" class="form-error">
              {{ getFieldError('roleId') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 1">
        <div class="mb-4 flex items-start gap-2">
          <UserRound class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Personal Details</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the member name and contact information.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="drawer-first-name" class="form-label">
              First Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-first-name"
              v-model="form.profile.firstName"
              required
              placeholder="Enter first name"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.firstName', 'firstName') }"
            />

            <p v-if="hasFieldError('profile.firstName', 'firstName')" class="form-error">
              {{ getFieldError('profile.firstName', 'firstName') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-middle-name" class="form-label">
              Middle Name
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-middle-name"
              v-model="form.profile.middleName"
              placeholder="Enter middle name"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.middleName', 'middleName') }"
            />

            <p v-if="hasFieldError('profile.middleName', 'middleName')" class="form-error">
              {{ getFieldError('profile.middleName', 'middleName') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-last-name" class="form-label">
              Last Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-last-name"
              v-model="form.profile.lastName"
              required
              placeholder="Enter last name"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.lastName', 'lastName') }"
            />

            <p v-if="hasFieldError('profile.lastName', 'lastName')" class="form-error">
              {{ getFieldError('profile.lastName', 'lastName') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-mobile-number" class="form-label">
              Mobile Number
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-mobile-number"
              v-model="form.profile.mobileNumber"
              type="tel"
              required
              placeholder="Enter mobile number"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.mobileNumber', 'mobileNumber') }"
            />

            <p v-if="hasFieldError('profile.mobileNumber', 'mobileNumber')" class="form-error">
              {{ getFieldError('profile.mobileNumber', 'mobileNumber') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-other-number" class="form-label">
              Other Number
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-other-number"
              v-model="form.profile.otherNumber"
              type="tel"
              placeholder="Enter alternative number"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.otherNumber', 'otherNumber') }"
            />

            <p v-if="hasFieldError('profile.otherNumber', 'otherNumber')" class="form-error">
              {{ getFieldError('profile.otherNumber', 'otherNumber') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-email-address" class="form-label">
              Email Address
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-email-address"
              v-model="form.profile.email"
              type="email"
              placeholder="Enter email address"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.email', 'email') }"
            />

            <p v-if="hasFieldError('profile.email', 'email')" class="form-error">
              {{ getFieldError('profile.email', 'email') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-kra-pin" class="form-label">
              KRA PIN
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-kra-pin"
              v-model="form.profile.kraPin"
              placeholder="Enter KRA PIN"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.kraPin', 'kraPin') }"
            />

            <p v-if="hasFieldError('profile.kraPin', 'kraPin')" class="form-error">
              {{ getFieldError('profile.kraPin', 'kraPin') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 2">
        <div class="mb-4 flex items-start gap-2">
          <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Location Details</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the administrative location of the cooperative member.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="drawer-county" class="form-label">
              County
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-county"
              v-model="form.profile.county"
              placeholder="Enter county"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.county', 'county') }"
            />

            <p v-if="hasFieldError('profile.county', 'county')" class="form-error">
              {{ getFieldError('profile.county', 'county') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-sub-county" class="form-label">
              Sub County
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-sub-county"
              v-model="form.profile.subCounty"
              placeholder="Enter sub county"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.subCounty', 'subCounty') }"
            />

            <p v-if="hasFieldError('profile.subCounty', 'subCounty')" class="form-error">
              {{ getFieldError('profile.subCounty', 'subCounty') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-division" class="form-label">
              Division
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-division"
              v-model="form.profile.division"
              placeholder="Enter division"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.division', 'division') }"
            />

            <p v-if="hasFieldError('profile.division', 'division')" class="form-error">
              {{ getFieldError('profile.division', 'division') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-location" class="form-label">
              Location
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-location"
              v-model="form.profile.location"
              placeholder="Enter location"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.location', 'location') }"
            />

            <p v-if="hasFieldError('profile.location', 'location')" class="form-error">
              {{ getFieldError('profile.location', 'location') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-sub-location" class="form-label">
              Sub Location
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-sub-location"
              v-model="form.profile.subLocation"
              placeholder="Enter sub location"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('profile.subLocation', 'subLocation') }"
            />

            <p v-if="hasFieldError('profile.subLocation', 'subLocation')" class="form-error">
              {{ getFieldError('profile.subLocation', 'subLocation') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 3">
        <div class="mb-4 flex items-start gap-2">
          <BadgeCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Review Details</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Confirm the details before saving.
            </p>
          </div>
        </div>

        <div class="grid gap-3">
          <div class="review-card">
            <p class="review-label">Member Name</p>
            <p class="review-value">{{ fullNamePreview }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Mobile Number</p>
            <p class="review-value">{{ form.profile.mobileNumber || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Email Address</p>
            <p class="review-value">{{ form.profile.email || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Member Status</p>
            <p class="review-value">{{ form.status }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Member Role</p>
            <p class="review-value">{{ currentRoleName }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">County / Location</p>
            <p class="review-value">
              {{ form.profile.county || form.profile.location || 'Not provided' }}
            </p>
          </div>
        </div>
      </section>
    </form>

    <template #footer>
      <div
        class="flex w-full flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button
          type="button"
          severity="secondary"
          outlined
          class="drawer-secondary-button"
          :disabled="isSubmitting || isFirstStep"
          @click="goToPreviousStep"
        >
          Back
        </Button>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            severity="secondary"
            outlined
            class="drawer-secondary-button"
            :disabled="isSubmitting"
            @click="handleClose"
          >
            Cancel
          </Button>

          <Button
            v-if="!isLastStep"
            type="button"
            class="drawer-primary-button"
            :disabled="isSubmitting"
            @click="goToNextStep"
          >
            Next
          </Button>

          <Button
            v-else
            type="submit"
            form="cooperative-member-drawer-form"
            class="drawer-primary-button"
            :disabled="isSubmitting"
          >
            <LoaderCircle v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" :stroke-width="2" />

            <Save v-else class="mr-2 h-4 w-4" :stroke-width="2" />

            {{ isSubmitting ? 'Saving...' : submitLabel }}
          </Button>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
:global(.cooperative-member-drawer.p-drawer) {
  border-left: 1px solid var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-member-drawer .p-drawer-header),
:global(.cooperative-member-drawer .p-drawer-content),
:global(.cooperative-member-drawer .p-drawer-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-member-drawer .p-drawer-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.cooperative-member-drawer .p-drawer-content) {
  padding: 1.5rem !important;
}

:global(.cooperative-member-drawer .p-drawer-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.cooperative-member-drawer-mask) {
  background-color: rgb(0 0 0 / 45%) !important;
  backdrop-filter: blur(2px);
}

:global(.cooperative-member-drawer .p-divider.p-divider-horizontal::before) {
  border-top-color: var(--color-border) !important;
}

.step-button {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-card) 92%, var(--color-surface));
  padding: 0.75rem;
  color: var(--color-secondary-text);
  text-align: left;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

.step-button:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-card));
  color: var(--color-heading);
}

.step-button-active {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-card));
  color: var(--color-heading);
}

.step-button-error {
  border-color: var(--color-error);
}

.step-number {
  display: flex;
  height: 1.65rem;
  width: 1.65rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  font-size: 0.75rem;
  font-weight: 800;
}

.step-button-error .step-number {
  background-color: var(--color-error);
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

.form-input-error {
  border-color: var(--color-error) !important;
}

.form-input-error:enabled:focus {
  border-color: var(--color-error) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 18%, transparent) !important;
}

.form-error {
  color: var(--color-error);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}

.review-card {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: color-mix(in srgb, var(--color-surface) 35%, var(--color-card));
  padding: 0.85rem 1rem;
}

.review-label {
  color: var(--color-muted-text);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.review-value {
  margin-top: 0.35rem;
  color: var(--color-heading);
  font-size: 0.9rem;
  font-weight: 700;
}

:global(.cooperative-member-drawer .p-inputtext) {
  padding: 0.7rem 0.8rem !important;
}

:global(.cooperative-member-drawer .p-select.form-input) {
  display: flex;
  align-items: center;
  padding: 0 !important;
}

:global(.cooperative-member-drawer .p-select.form-input:hover) {
  border-color: var(--color-primary) !important;
}

:global(.cooperative-member-drawer .p-select.form-input.p-focus) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent) !important;
}

:global(.cooperative-member-drawer .p-select.form-input.form-input-error) {
  border-color: var(--color-error) !important;
}

:global(.cooperative-member-drawer .p-select.form-input.form-input-error.p-focus) {
  border-color: var(--color-error) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 18%, transparent) !important;
}

:global(.cooperative-member-drawer .p-select-label) {
  padding: 0.7rem 0.8rem !important;
  color: var(--color-heading) !important;
  font-size: 0.875rem !important;
}

:global(.cooperative-member-drawer .p-select-label.p-placeholder) {
  color: var(--color-muted-text) !important;
}

:global(.cooperative-member-drawer .p-select-dropdown) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-member-drawer .drawer-icon-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-member-drawer .drawer-icon-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-member-drawer .drawer-secondary-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-member-drawer .drawer-secondary-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-member-drawer .drawer-primary-button.p-button) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-member-drawer .drawer-primary-button.p-button:hover) {
  border-color: var(--color-primary-hover) !important;
  background-color: var(--color-primary-hover) !important;
}
</style>
