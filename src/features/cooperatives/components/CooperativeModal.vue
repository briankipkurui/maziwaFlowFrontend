<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import {
  BadgeCheck,
  Building2,
  FileText,
  LoaderCircle,
  MapPin,
  Save,
  ShieldCheck,
  X,
} from 'lucide-vue-next';

import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import ToggleSwitch from 'primevue/toggleswitch';

import { useCooperativeUnionsQuery } from '@/features/cooperativeUnion/composables/queries/useCooperativeUnionsQuery';

import type { FieldErrors } from '@/utils/formErrors';
import type { CooperativeUnion } from '@/features/cooperativeUnion/types/cooperativeUnion';
import type { Cooperative, CooperativePayload } from '../types/cooperative';

const props = withDefaults(
  defineProps<{
    open: boolean;
    cooperative?: Cooperative | null;
    isSubmitting?: boolean;
    serverErrors?: FieldErrors;
    generalError?: string;
  }>(),
  {
    cooperative: null,
    isSubmitting: false,
    serverErrors: () => ({}),
    generalError: '',
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativePayload];
}>();

const currentStep = ref(0);

const steps = [
  {
    label: 'Basic Info',
    description: 'Registration details',
  },
  {
    label: 'Location',
    description: 'Administrative location',
  },
  {
    label: 'Insurance',
    description: 'Insurance cover',
  },
  {
    label: 'Coordinates',
    description: 'GPS and notes',
  },
  {
    label: 'Review',
    description: 'Confirm and save',
  },
];

const stepErrorFields = [
  [
    'code',
    'groupName',
    'mobilePhone',
    'kraPin',
    'incorporationNumber',
    'cooperativeUnionId',
    'mainActivity',
    'imgUrl',
  ],
  ['county', 'subCounty', 'division', 'location', 'subLocation', 'ward'],
  ['hasInsurance', 'insuranceProvider', 'insuranceType', 'enterpriseCovered'],
  ['latitude', 'longitude', 'altitude', 'precision', 'notes'],
  ['general'],
];

const isEditMode = computed(() => Boolean(props.cooperative));

const isFirstStep = computed(() => currentStep.value === 0);

const isLastStep = computed(() => currentStep.value === steps.length - 1);

const drawerTitle = computed(() =>
  isEditMode.value ? 'Update Cooperative' : 'Create Cooperative',
);

const submitLabel = computed(() =>
  isEditMode.value ? 'Update Cooperative' : 'Create Cooperative',
);

const currentStepLabel = computed(() => steps[currentStep.value]?.label ?? 'Basic Info');

const createEmptyForm = (): CooperativePayload => ({
  code: '',
  groupName: '',
  mobilePhone: '',
  imgUrl: '',
  county: '',
  subCounty: '',
  division: '',
  location: '',
  subLocation: '',
  ward: '',
  hasInsurance: false,
  insuranceProvider: '',
  insuranceType: '',
  enterpriseCovered: '',
  incorporationNumber: '',
  kraPin: '',
  latitude: '',
  longitude: '',
  altitude: '',
  precision: '',
  mainActivity: '',
  notes: '',
  cooperativeUnionId: undefined,
});

const form = reactive<CooperativePayload>(createEmptyForm());

/*
  Cooperative union lookup.
  This fixes the list by using pageSize instead of limit.
*/
const unionSearch = ref('');

const cooperativeUnionQueryParams = computed(() => ({
  page: 1,
  pageSize: 100,
  search: unionSearch.value.trim() || undefined,
}));

const {
  data: cooperativeUnionData,
  isLoading: isLoadingCooperativeUnions,
  isError: isCooperativeUnionError,
  refetch: refetchCooperativeUnions,
} = useCooperativeUnionsQuery(cooperativeUnionQueryParams);

type CooperativeUnionOption = Pick<CooperativeUnion, 'id' | 'name'>;

const cooperativeUnionOptions = computed<CooperativeUnionOption[]>(() => {
  const unions = cooperativeUnionData.value?.results ?? [];

  /*
    Keep an existing selected ID visible while editing,
    even when it is not included in the current search results.
  */
  if (!form.cooperativeUnionId || unions.some((union) => union.id === form.cooperativeUnionId)) {
    return unions;
  }

  return [
    {
      id: form.cooperativeUnionId,
      name: `Selected union (${form.cooperativeUnionId})`,
    },
    ...unions,
  ];
});

const cooperativeUnionIdModel = computed<string | null>({
  get: () => form.cooperativeUnionId ?? null,
  set: (value) => {
    form.cooperativeUnionId = value ?? undefined;
  },
});

const handleUnionFilter = (event: { value: string }) => {
  unionSearch.value = event.value;
};

const resetForm = () => {
  Object.assign(form, createEmptyForm());
  unionSearch.value = '';
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

const getExistingCooperativeUnionId = (cooperative?: Cooperative | null): string | undefined => {
  if (!cooperative) {
    return undefined;
  }

  const cooperativeWithUnion = cooperative as Cooperative & {
    cooperativeUnion?: CooperativeUnion | null;
    union?: CooperativeUnion | null;
    unionId?: string;
  };

  return (
    cooperative.cooperativeUnionId ||
    cooperativeWithUnion.unionId ||
    cooperativeWithUnion.cooperativeUnion?.id ||
    cooperativeWithUnion.union?.id ||
    undefined
  );
};

const populateForm = (cooperative?: Cooperative | null) => {
  resetForm();

  if (!cooperative) {
    return;
  }

  Object.assign(form, {
    code: cooperative.code ?? '',
    groupName: cooperative.groupName ?? '',
    mobilePhone: cooperative.mobilePhone ?? '',
    imgUrl: cooperative.imgUrl ?? '',
    county: cooperative.county ?? '',
    subCounty: cooperative.subCounty ?? '',
    division: cooperative.division ?? '',
    location: cooperative.location ?? '',
    subLocation: cooperative.subLocation ?? '',
    ward: cooperative.ward ?? '',
    hasInsurance: cooperative.hasInsurance ?? false,
    insuranceProvider: cooperative.insuranceProvider ?? '',
    insuranceType: cooperative.insuranceType ?? '',
    enterpriseCovered: cooperative.enterpriseCovered ?? '',
    incorporationNumber: cooperative.incorporationNumber ?? '',
    kraPin: cooperative.kraPin ?? '',
    latitude: cooperative.latitude ?? '',
    longitude: cooperative.longitude ?? '',
    altitude: cooperative.altitude ?? '',
    precision: cooperative.precision ?? '',
    mainActivity: cooperative.mainActivity ?? '',
    notes: cooperative.notes ?? '',
    cooperativeUnionId: getExistingCooperativeUnionId(cooperative),
  });
};

const selectedUnionName = computed(() => {
  const selectedUnion = cooperativeUnionOptions.value.find(
    (union) => union.id === form.cooperativeUnionId,
  );

  return selectedUnion?.name || 'Not selected';
});

const locationPreview = computed(() => {
  return [form.county, form.subCounty, form.ward, form.location].filter(Boolean).join(', ');
});

const coordinatePreview = computed(() => {
  const coordinates = [form.latitude, form.longitude].filter(Boolean).join(', ');

  return coordinates || 'Not provided';
});

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return;
    }

    currentStep.value = 0;
    populateForm(props.cooperative);
    refetchCooperativeUnions();
  },
);

watch(
  () => props.cooperative,
  (cooperative) => {
    if (!props.open) {
      return;
    }

    populateForm(cooperative);
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

watch(
  () => form.hasInsurance,
  (hasInsurance) => {
    if (hasInsurance) {
      return;
    }

    form.insuranceProvider = '';
    form.insuranceType = '';
    form.enterpriseCovered = '';
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
    code: form.code.trim(),
    groupName: form.groupName.trim(),
    mobilePhone: form.mobilePhone?.trim() || '',
    imgUrl: form.imgUrl?.trim() || '',
    county: form.county.trim(),
    subCounty: form.subCounty?.trim() || '',
    division: form.division?.trim() || '',
    location: form.location?.trim() || '',
    subLocation: form.subLocation?.trim() || '',
    ward: form.ward?.trim() || '',
    hasInsurance: Boolean(form.hasInsurance),
    insuranceProvider: form.hasInsurance ? form.insuranceProvider?.trim() || '' : '',
    insuranceType: form.hasInsurance ? form.insuranceType?.trim() || '' : '',
    enterpriseCovered: form.hasInsurance ? form.enterpriseCovered?.trim() || '' : '',
    incorporationNumber: form.incorporationNumber?.trim() || '',
    kraPin: form.kraPin.trim(),
    latitude: form.latitude?.trim() || '',
    longitude: form.longitude?.trim() || '',
    altitude: form.altitude?.trim() || '',
    precision: form.precision?.trim() || '',
    mainActivity: form.mainActivity?.trim() || '',
    notes: form.notes?.trim() || '',
    cooperativeUnionId: form.cooperativeUnionId?.trim() || undefined,
  });
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
    class="cooperative-drawer"
    :style="{ width: 'min(860px, 100vw)' }"
    :pt="{
      mask: {
        class: 'cooperative-drawer-mask',
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

    <div class="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
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

    <form id="cooperative-drawer-form" class="space-y-6" @submit.prevent="handleSubmit">
      <section v-if="currentStep === 0">
        <div class="mb-4 flex items-start gap-2">
          <Building2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Basic Information</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the cooperative registration and contact details.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="drawer-cooperative-code" class="form-label">
              Cooperative Code
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-cooperative-code"
              v-model="form.code"
              required
              placeholder="Enter cooperative code"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('code') }"
            />

            <p v-if="hasFieldError('code')" class="form-error">
              {{ getFieldError('code') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-group-name" class="form-label">
              Cooperative Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-group-name"
              v-model="form.groupName"
              required
              placeholder="Enter cooperative name"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('groupName') }"
            />

            <p v-if="hasFieldError('groupName')" class="form-error">
              {{ getFieldError('groupName') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-mobile-phone" class="form-label">
              Mobile Phone
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-mobile-phone"
              v-model="form.mobilePhone"
              type="tel"
              required
              placeholder="Enter mobile phone"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('mobilePhone') }"
            />

            <p v-if="hasFieldError('mobilePhone')" class="form-error">
              {{ getFieldError('mobilePhone') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-kra-pin" class="form-label">
              KRA PIN
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-kra-pin"
              v-model="form.kraPin"
              required
              placeholder="Enter KRA PIN"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('kraPin') }"
            />

            <p v-if="hasFieldError('kraPin')" class="form-error">
              {{ getFieldError('kraPin') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-incorporation-number" class="form-label">
              Incorporation Number
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-incorporation-number"
              v-model="form.incorporationNumber"
              placeholder="Enter incorporation number"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('incorporationNumber') }"
            />

            <p v-if="hasFieldError('incorporationNumber')" class="form-error">
              {{ getFieldError('incorporationNumber') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-cooperative-union" class="form-label">
              Cooperative Union
              <span class="text-muted-text">(Optional)</span>
            </label>

            <Select
              id="drawer-cooperative-union"
              v-model="cooperativeUnionIdModel"
              :options="cooperativeUnionOptions"
              option-label="name"
              option-value="id"
              filter
              show-clear
              :loading="isLoadingCooperativeUnions"
              placeholder="Select cooperative union"
              class="form-input"
              append-to="self"
              :class="{ 'form-input-error': hasFieldError('cooperativeUnionId') }"
              @filter="handleUnionFilter"
            />

            <p v-if="hasFieldError('cooperativeUnionId')" class="form-error">
              {{ getFieldError('cooperativeUnionId') }}
            </p>

            <p v-else-if="isCooperativeUnionError" class="form-error">
              Failed to load cooperative unions.
            </p>

            <p
              v-else-if="!isLoadingCooperativeUnions && !cooperativeUnionOptions.length"
              class="text-xs font-medium text-muted-text"
            >
              No cooperative unions found.
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-main-activity" class="form-label">
              Main Activity
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-main-activity"
              v-model="form.mainActivity"
              placeholder="Enter main activity"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('mainActivity') }"
            />

            <p v-if="hasFieldError('mainActivity')" class="form-error">
              {{ getFieldError('mainActivity') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-image-url" class="form-label">
              Image URL
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-image-url"
              v-model="form.imgUrl"
              type="url"
              placeholder="Enter image URL"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('imgUrl') }"
            />

            <p v-if="hasFieldError('imgUrl')" class="form-error">
              {{ getFieldError('imgUrl') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 1">
        <div class="mb-4 flex items-start gap-2">
          <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Location Details</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the administrative location of the cooperative.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="drawer-county" class="form-label">
              County
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-county"
              v-model="form.county"
              required
              placeholder="Enter county"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('county') }"
            />

            <p v-if="hasFieldError('county')" class="form-error">
              {{ getFieldError('county') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-sub-county" class="form-label">
              Sub County
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-sub-county"
              v-model="form.subCounty"
              placeholder="Enter sub county"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('subCounty') }"
            />

            <p v-if="hasFieldError('subCounty')" class="form-error">
              {{ getFieldError('subCounty') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-division" class="form-label">
              Division
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-division"
              v-model="form.division"
              placeholder="Enter division"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('division') }"
            />

            <p v-if="hasFieldError('division')" class="form-error">
              {{ getFieldError('division') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-location" class="form-label">
              Location
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-location"
              v-model="form.location"
              placeholder="Enter location"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('location') }"
            />

            <p v-if="hasFieldError('location')" class="form-error">
              {{ getFieldError('location') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-sub-location" class="form-label">
              Sub Location
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-sub-location"
              v-model="form.subLocation"
              placeholder="Enter sub location"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('subLocation') }"
            />

            <p v-if="hasFieldError('subLocation')" class="form-error">
              {{ getFieldError('subLocation') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-ward" class="form-label">
              Ward
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-ward"
              v-model="form.ward"
              placeholder="Enter ward"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('ward') }"
            />

            <p v-if="hasFieldError('ward')" class="form-error">
              {{ getFieldError('ward') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 2">
        <div class="mb-4 flex items-start gap-2">
          <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Insurance Details</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Specify whether the cooperative has an active insurance cover.
            </p>
          </div>
        </div>

        <div
          class="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/30 px-4 py-3"
        >
          <div>
            <p class="text-sm font-semibold text-heading">Has Insurance Cover</p>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Enable this option to provide the insurance cover details.
            </p>
          </div>

          <ToggleSwitch v-model="form.hasInsurance" />
        </div>

        <div v-if="form.hasInsurance" class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="drawer-insurance-provider" class="form-label">
              Insurance Provider
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-insurance-provider"
              v-model="form.insuranceProvider"
              required
              placeholder="Enter insurance provider"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('insuranceProvider') }"
            />

            <p v-if="hasFieldError('insuranceProvider')" class="form-error">
              {{ getFieldError('insuranceProvider') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-insurance-type" class="form-label">
              Insurance Type
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-insurance-type"
              v-model="form.insuranceType"
              required
              placeholder="Enter insurance type"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('insuranceType') }"
            />

            <p v-if="hasFieldError('insuranceType')" class="form-error">
              {{ getFieldError('insuranceType') }}
            </p>
          </div>

          <div class="form-field sm:col-span-2">
            <label for="drawer-enterprise-covered" class="form-label">
              Enterprise Covered
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-enterprise-covered"
              v-model="form.enterpriseCovered"
              placeholder="Enter enterprise covered"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('enterpriseCovered') }"
            />

            <p v-if="hasFieldError('enterpriseCovered')" class="form-error">
              {{ getFieldError('enterpriseCovered') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 3">
        <div class="mb-4 flex items-start gap-2">
          <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Coordinates</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture GPS values and any additional notes where available.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="drawer-latitude" class="form-label">
              Latitude
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-latitude"
              v-model="form.latitude"
              placeholder="Latitude"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('latitude') }"
            />

            <p v-if="hasFieldError('latitude')" class="form-error">
              {{ getFieldError('latitude') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-longitude" class="form-label">
              Longitude
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-longitude"
              v-model="form.longitude"
              placeholder="Longitude"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('longitude') }"
            />

            <p v-if="hasFieldError('longitude')" class="form-error">
              {{ getFieldError('longitude') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-altitude" class="form-label">
              Altitude
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-altitude"
              v-model="form.altitude"
              placeholder="Altitude"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('altitude') }"
            />

            <p v-if="hasFieldError('altitude')" class="form-error">
              {{ getFieldError('altitude') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-precision" class="form-label">
              Precision
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="drawer-precision"
              v-model="form.precision"
              placeholder="Precision"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('precision') }"
            />

            <p v-if="hasFieldError('precision')" class="form-error">
              {{ getFieldError('precision') }}
            </p>
          </div>

          <div class="form-field sm:col-span-2">
            <div class="mb-1 flex items-start gap-2">
              <FileText class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

              <label for="drawer-notes" class="form-label">
                Notes
                <span class="text-muted-text">(Optional)</span>
              </label>
            </div>

            <Textarea
              id="drawer-notes"
              v-model="form.notes"
              rows="3"
              auto-resize
              placeholder="Enter additional notes"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('notes') }"
            />

            <p v-if="hasFieldError('notes')" class="form-error">
              {{ getFieldError('notes') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 4">
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
            <p class="review-label">Cooperative Name</p>
            <p class="review-value">{{ form.groupName || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Cooperative Code</p>
            <p class="review-value">{{ form.code || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Mobile Phone</p>
            <p class="review-value">{{ form.mobilePhone || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">KRA PIN</p>
            <p class="review-value">{{ form.kraPin || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Cooperative Union</p>
            <p class="review-value">{{ selectedUnionName }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">County / Location</p>
            <p class="review-value">{{ locationPreview || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Insurance</p>
            <p class="review-value">
              {{ form.hasInsurance ? 'Has insurance cover' : 'No insurance cover' }}
            </p>
          </div>

          <div class="review-card">
            <p class="review-label">Insurance Details</p>
            <p class="review-value">
              {{
                form.hasInsurance
                  ? [form.insuranceProvider, form.insuranceType, form.enterpriseCovered]
                      .filter(Boolean)
                      .join(' / ') || 'Not provided'
                  : 'Not applicable'
              }}
            </p>
          </div>

          <div class="review-card">
            <p class="review-label">Main Activity</p>
            <p class="review-value">{{ form.mainActivity || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Coordinates</p>
            <p class="review-value">{{ coordinatePreview }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Altitude / Precision</p>
            <p class="review-value">
              {{ form.altitude || 'No altitude' }} /
              {{ form.precision || 'No precision' }}
            </p>
          </div>

          <div class="review-card">
            <p class="review-label">Notes</p>
            <p class="review-value">{{ form.notes || 'Not provided' }}</p>
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
            form="cooperative-drawer-form"
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
:global(.cooperative-drawer.p-drawer) {
  border-left: 1px solid var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-drawer .p-drawer-header),
:global(.cooperative-drawer .p-drawer-content),
:global(.cooperative-drawer .p-drawer-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-drawer .p-drawer-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.cooperative-drawer .p-drawer-content) {
  padding: 1.5rem !important;
}

:global(.cooperative-drawer .p-drawer-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.cooperative-drawer-mask) {
  background-color: rgb(0 0 0 / 45%) !important;
  backdrop-filter: blur(2px);
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

:global(.cooperative-drawer .p-inputtext) {
  padding: 0.7rem 0.8rem !important;
}

:global(.cooperative-drawer textarea.p-inputtextarea) {
  min-height: 5rem;
  resize: vertical;
}

:global(.cooperative-drawer .p-select.form-input) {
  display: flex;
  align-items: center;
  padding: 0 !important;
}

:global(.cooperative-drawer .p-select.form-input:hover) {
  border-color: var(--color-primary) !important;
}

:global(.cooperative-drawer .p-select.form-input.p-focus) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent) !important;
}

:global(.cooperative-drawer .p-select-label) {
  padding: 0.7rem 0.8rem !important;
  color: var(--color-heading) !important;
  font-size: 0.875rem !important;
}

:global(.cooperative-drawer .p-select-label.p-placeholder) {
  color: var(--color-muted-text) !important;
}

:global(.cooperative-drawer .p-select-dropdown),
:global(.cooperative-drawer .p-select-clear-icon) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-drawer .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background-color: var(--color-primary) !important;
}

:global(.cooperative-drawer .p-toggleswitch:not(.p-disabled):hover .p-toggleswitch-slider) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent) !important;
}

:global(.cooperative-drawer .drawer-icon-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-drawer .drawer-icon-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-drawer .drawer-secondary-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-drawer .drawer-secondary-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-drawer .drawer-primary-button.p-button) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-drawer .drawer-primary-button.p-button:hover) {
  border-color: var(--color-primary-hover) !important;
  background-color: var(--color-primary-hover) !important;
}
</style>
