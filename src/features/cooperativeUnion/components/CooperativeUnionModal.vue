<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { LoaderCircle, MapPin, Save, X } from 'lucide-vue-next';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

import type { CooperativeUnion, CooperativeUnionPayload } from '../types/cooperativeUnion';

const props = withDefaults(
  defineProps<{
    open: boolean;
    union?: CooperativeUnion | null;
    isSubmitting?: boolean;
  }>(),
  {
    union: null,
    isSubmitting: false,
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativeUnionPayload];
}>();

const isEditMode = computed(() => Boolean(props.union));

const dialogTitle = computed(() =>
  isEditMode.value ? 'Update Cooperative Union' : 'Create Cooperative Union',
);

const submitLabel = computed(() => (isEditMode.value ? 'Update Union' : 'Create Union'));

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

const populateForm = (union?: CooperativeUnion | null) => {
  resetForm();

  if (!union) return;

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

watch(
  () => props.open,
  (open) => {
    if (!open) return;

    populateForm(props.union);
  },
);

watch(
  () => props.union,
  (union) => {
    if (!props.open) return;

    populateForm(union);
  },
);

const handleClose = () => {
  if (props.isSubmitting) return;

  emit('close');
};

const handleVisibilityChange = (visible: boolean) => {
  if (!visible) {
    handleClose();
  }
};

const handleSubmit = () => {
  emit('submit', { ...form });
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
    class="cooperative-union-dialog"
    :style="{ width: 'min(960px, calc(100vw - 2rem))' }"
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
            Enter the cooperative union registration, location and coordinate details.
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

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Basic Information -->
      <section>
        <div class="mb-4">
          <h3 class="text-sm font-bold text-heading">Basic Information</h3>

          <p class="mt-1 text-xs leading-5 text-secondary-text">
            Capture the union name, registration details and description.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="form-field">
            <label for="union-name" class="form-label">
              Union Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="union-name"
              v-model="form.name"
              required
              placeholder="Enter union name"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="kra-pin" class="form-label">
              KRA PIN
              <span class="text-error">*</span>
            </label>

            <InputText
              id="kra-pin"
              v-model="form.kraPin"
              required
              placeholder="Enter KRA PIN"
              class="form-input"
            />
          </div>

          <div class="form-field sm:col-span-2">
            <label for="description" class="form-label">
              Description
              <span class="text-muted-text">(Optional)</span>
            </label>

            <Textarea
              id="description"
              v-model="form.description"
              rows="3"
              auto-resize
              placeholder="Enter description"
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
              Capture the administrative location of the cooperative union.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="form-field">
            <label for="county" class="form-label">
              County
              <span class="text-error">*</span>
            </label>

            <InputText
              id="county"
              v-model="form.county"
              required
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
              v-model="form.subCounty"
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
              v-model="form.division"
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
              v-model="form.location"
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
              v-model="form.subLocation"
              placeholder="Enter sub location"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="ward" class="form-label">
              Ward
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText id="ward" v-model="form.ward" placeholder="Enter ward" class="form-input" />
          </div>
        </div>
      </section>

      <Divider />

      <!-- Coordinates -->
      <section>
        <div class="mb-4">
          <h3 class="text-sm font-bold text-heading">Coordinates</h3>

          <p class="mt-1 text-xs leading-5 text-secondary-text">
            Capture GPS values where they are available.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="form-field">
            <label for="latitude" class="form-label">
              Latitude
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="latitude"
              v-model="form.latitude"
              placeholder="Latitude"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="longitude" class="form-label">
              Longitude
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="longitude"
              v-model="form.longitude"
              placeholder="Longitude"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="altitude" class="form-label">
              Altitude
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="altitude"
              v-model="form.altitude"
              placeholder="Altitude"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="precision" class="form-label">
              Precision
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="precision"
              v-model="form.precision"
              placeholder="Precision"
              class="form-input"
            />
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
          type="button"
          class="modal-primary-button"
          :disabled="isSubmitting"
          @click="handleSubmit"
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
  :global() is required so that the theme styles reach the rendered modal.
*/

:global(.cooperative-union-dialog.p-dialog) {
  overflow: hidden;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.875rem !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
  box-shadow: 0 20px 45px rgb(0 0 0 / 18%) !important;
}

:global(.cooperative-union-dialog .p-dialog-header),
:global(.cooperative-union-dialog .p-dialog-content),
:global(.cooperative-union-dialog .p-dialog-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-union-dialog .p-dialog-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.cooperative-union-dialog .p-dialog-content) {
  max-height: min(70vh, 760px);
  overflow-y: auto;
  padding: 1.5rem !important;
}

:global(.cooperative-union-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.cooperative-union-dialog .p-divider.p-divider-horizontal::before) {
  border-top-color: var(--color-border) !important;
}

:global(.cooperative-union-dialog-mask) {
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

:global(.cooperative-union-dialog .p-inputtext) {
  padding: 0.7rem 0.8rem !important;
}

:global(.cooperative-union-dialog textarea.p-inputtextarea) {
  min-height: 5rem;
  resize: vertical;
}

:global(.cooperative-union-dialog .modal-icon-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-union-dialog .modal-icon-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-union-dialog .modal-secondary-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-union-dialog .modal-secondary-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-union-dialog .modal-primary-button.p-button) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-union-dialog .modal-primary-button.p-button:hover) {
  border-color: var(--color-primary-hover) !important;
  background-color: var(--color-primary-hover) !important;
}
</style>
