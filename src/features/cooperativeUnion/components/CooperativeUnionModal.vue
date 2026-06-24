<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { BadgeCheck, Building2, LoaderCircle, MapPin, Save, X } from 'lucide-vue-next';

import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

import type { FieldErrors } from '@/utils/formErrors';

import type { CooperativeUnion, CooperativeUnionPayload } from '../types/cooperativeUnion';

const props = withDefaults(
  defineProps<{
    open: boolean;
    union?: CooperativeUnion | null;
    isSubmitting?: boolean;
    serverErrors?: FieldErrors;
    generalError?: string;
  }>(),
  {
    union: null,
    isSubmitting: false,
    serverErrors: () => ({}),
    generalError: '',
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativeUnionPayload];
}>();

const currentStep = ref(0);

const steps = [
  {
    label: 'Basic Info',
    description: 'Name and registration',
  },
  {
    label: 'Location',
    description: 'Administrative location',
  },
  {
    label: 'Coordinates',
    description: 'GPS values',
  },
  {
    label: 'Review',
    description: 'Confirm and save',
  },
];

const stepErrorFields = [
  ['name', 'kraPin', 'description'],
  ['county', 'subCounty', 'division', 'location', 'subLocation', 'ward'],
  ['latitude', 'longitude', 'altitude', 'precision'],
  ['general'],
];

const isEditMode = computed(() => Boolean(props.union));

const isFirstStep = computed(() => currentStep.value === 0);

const isLastStep = computed(() => currentStep.value === steps.length - 1);

const drawerTitle = computed(() =>
  isEditMode.value ? 'Update Cooperative Union' : 'Create Cooperative Union',
);

const submitLabel = computed(() => (isEditMode.value ? 'Update Union' : 'Create Union'));

const currentStepLabel = computed(() => steps[currentStep.value]?.label ?? 'Basic Info');

const createEmptyForm = (): CooperativeUnionPayload => ({
  name: '',
  description: '',
  county: '',
  subCounty: '',
  division: '',
  location: '',
  subLocation: '',
  ward: '',
  kraPin: '',
  latitude: '',
  longitude: '',
  altitude: '',
  precision: '',
});

const form = reactive<CooperativeUnionPayload>(createEmptyForm());

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

const populateForm = (union?: CooperativeUnion | null) => {
  resetForm();

  if (!union) {
    return;
  }

  Object.assign(form, {
    name: union.name ?? '',
    description: union.description ?? '',
    county: union.county ?? '',
    subCounty: union.subCounty ?? '',
    division: union.division ?? '',
    location: union.location ?? '',
    subLocation: union.subLocation ?? '',
    ward: union.ward ?? '',
    kraPin: union.kraPin ?? '',
    latitude: union.latitude ?? '',
    longitude: union.longitude ?? '',
    altitude: union.altitude ?? '',
    precision: union.precision ?? '',
  });
};

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
    populateForm(props.union);
  },
);

watch(
  () => props.union,
  (union) => {
    if (!props.open) {
      return;
    }

    populateForm(union);
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
  emit('submit', {
    name: form.name.trim(),
    description: form.description?.trim() || '',
    county: form.county.trim(),
    subCounty: form.subCounty?.trim() || '',
    division: form.division?.trim() || '',
    location: form.location?.trim() || '',
    subLocation: form.subLocation?.trim() || '',
    ward: form.ward?.trim() || '',
    kraPin: form.kraPin.trim(),
    latitude: form.latitude?.trim() || '',
    longitude: form.longitude?.trim() || '',
    altitude: form.altitude?.trim() || '',
    precision: form.precision?.trim() || '',
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
    class="cooperative-union-drawer"
    :style="{ width: 'min(760px, 100vw)' }"
    :pt="{
      mask: {
        class: 'cooperative-union-drawer-mask',
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

    <form id="cooperative-union-drawer-form" class="space-y-6" @submit.prevent="handleSubmit">
      <section v-if="currentStep === 0">
        <div class="mb-4 flex items-start gap-2">
          <Building2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Basic Information</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the union name, KRA PIN and description.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="drawer-union-name" class="form-label">
              Union Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-union-name"
              v-model="form.name"
              required
              placeholder="Enter union name"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('name') }"
            />

            <p v-if="hasFieldError('name')" class="form-error">
              {{ getFieldError('name') }}
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

          <div class="form-field sm:col-span-2">
            <label for="drawer-description" class="form-label">
              Description
              <span class="text-muted-text">(Optional)</span>
            </label>

            <Textarea
              id="drawer-description"
              v-model="form.description"
              rows="3"
              auto-resize
              placeholder="Enter description"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('description') }"
            />

            <p v-if="hasFieldError('description')" class="form-error">
              {{ getFieldError('description') }}
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
              Capture the administrative location of the cooperative union.
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
          <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Coordinates</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture GPS values where they are available.
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
            <p class="review-label">Union Name</p>
            <p class="review-value">{{ form.name || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">KRA PIN</p>
            <p class="review-value">{{ form.kraPin || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">County / Location</p>
            <p class="review-value">{{ locationPreview || 'Not provided' }}</p>
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
            <p class="review-label">Description</p>
            <p class="review-value">{{ form.description || 'Not provided' }}</p>
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
            form="cooperative-union-drawer-form"
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
:global(.cooperative-union-drawer.p-drawer) {
  border-left: 1px solid var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-union-drawer .p-drawer-header),
:global(.cooperative-union-drawer .p-drawer-content),
:global(.cooperative-union-drawer .p-drawer-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-union-drawer .p-drawer-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.cooperative-union-drawer .p-drawer-content) {
  padding: 1.5rem !important;
}

:global(.cooperative-union-drawer .p-drawer-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.cooperative-union-drawer-mask) {
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

:global(.cooperative-union-drawer .p-inputtext) {
  padding: 0.7rem 0.8rem !important;
}

:global(.cooperative-union-drawer textarea.p-inputtextarea) {
  min-height: 5rem;
  resize: vertical;
}

:global(.cooperative-union-drawer .drawer-icon-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-union-drawer .drawer-icon-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-union-drawer .drawer-secondary-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-union-drawer .drawer-secondary-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-union-drawer .drawer-primary-button.p-button) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-union-drawer .drawer-primary-button.p-button:hover) {
  border-color: var(--color-primary-hover) !important;
  background-color: var(--color-primary-hover) !important;
}
</style>
