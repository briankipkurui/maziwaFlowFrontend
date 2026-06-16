<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { Building2, FileText, LoaderCircle, MapPin, Save, ShieldCheck, X } from 'lucide-vue-next';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import ToggleSwitch from 'primevue/toggleswitch';

import { useCooperativeUnionsQuery } from '@/features/cooperativeUnion/composables/queries/useCooperativeUnionsQuery';

import type { CooperativeUnion } from '@/features/cooperativeUnion/types/cooperativeUnion';
import type { Cooperative, CooperativePayload } from '../types/cooperative';

const props = withDefaults(
  defineProps<{
    open: boolean;
    cooperative?: Cooperative | null;
    isSubmitting?: boolean;
  }>(),
  {
    cooperative: null,
    isSubmitting: false,
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativePayload];
}>();

const isEditMode = computed(() => Boolean(props.cooperative));

const dialogTitle = computed(() =>
  isEditMode.value ? 'Update Cooperative' : 'Create Cooperative',
);

const submitLabel = computed(() =>
  isEditMode.value ? 'Update Cooperative' : 'Create Cooperative',
);

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
  PrimeVue Select provides filtering and replaces the previous custom dropdown.
*/
const unionSearch = ref('');

const cooperativeUnionQueryParams = computed(() => ({
  page: 1,
  limit: 20,
  search: unionSearch.value.trim() || undefined,
}));

const {
  data: cooperativeUnionData,
  isLoading: isLoadingCooperativeUnions,
  isError: isCooperativeUnionError,
} = useCooperativeUnionsQuery(cooperativeUnionQueryParams);

type CooperativeUnionOption = Pick<CooperativeUnion, 'id' | 'name'>;

const cooperativeUnionOptions = computed<CooperativeUnionOption[]>(() => {
  const unions = cooperativeUnionData.value?.results ?? [];

  /*
    Keep an existing selected ID visible while editing, even when it is not
    included in the currently loaded search results.
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

/*
  Form population.
*/
const resetForm = () => {
  Object.assign(form, createEmptyForm());
  unionSearch.value = '';
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
    cooperativeUnionId: cooperative.cooperativeUnionId || undefined,
  });
};

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return;
    }

    populateForm(props.cooperative);
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

/*
  Dialog actions.
*/
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
    ...form,
    cooperativeUnionId: form.cooperativeUnionId?.trim() || undefined,
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
    class="cooperative-dialog"
    :style="{ width: 'min(1060px, calc(100vw - 2rem))' }"
    :pt="{
      mask: {
        class: 'cooperative-dialog-mask',
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
            Enter the cooperative registration, location and operational details.
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
        <div class="mb-4 flex items-start gap-2">
          <Building2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Basic Information</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Capture the cooperative registration and contact details.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="form-field">
            <label for="cooperative-code" class="form-label">
              Cooperative Code
              <span class="text-error">*</span>
            </label>

            <InputText
              id="cooperative-code"
              v-model="form.code"
              required
              placeholder="Enter cooperative code"
              class="form-input"
            />
          </div>

          <div class="form-field sm:col-span-2">
            <label for="group-name" class="form-label">
              Cooperative Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="group-name"
              v-model="form.groupName"
              required
              placeholder="Enter cooperative name"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="mobile-phone" class="form-label">
              Mobile Phone
              <span class="text-error">*</span>
            </label>

            <InputText
              id="mobile-phone"
              v-model="form.mobilePhone"
              type="tel"
              required
              placeholder="Enter mobile phone"
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

          <div class="form-field">
            <label for="incorporation-number" class="form-label">
              Incorporation Number
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="incorporation-number"
              v-model="form.incorporationNumber"
              placeholder="Enter incorporation number"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="cooperative-union" class="form-label">
              Cooperative Union
              <span class="text-muted-text">(Optional)</span>
            </label>

            <Select
              id="cooperative-union"
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
              @filter="handleUnionFilter"
            />

            <p v-if="isCooperativeUnionError" class="text-xs font-medium text-error">
              Failed to load cooperative unions.
            </p>
          </div>

          <div class="form-field">
            <label for="main-activity" class="form-label">
              Main Activity
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="main-activity"
              v-model="form.mainActivity"
              placeholder="Enter main activity"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="image-url" class="form-label">
              Image URL
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="image-url"
              v-model="form.imgUrl"
              type="url"
              placeholder="Enter image URL"
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
              Capture the administrative location of the cooperative.
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

      <!-- Insurance Details -->
      <section>
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

        <div v-if="form.hasInsurance" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="form-field">
            <label for="insurance-provider" class="form-label">
              Insurance Provider
              <span class="text-error">*</span>
            </label>

            <InputText
              id="insurance-provider"
              v-model="form.insuranceProvider"
              required
              placeholder="Enter insurance provider"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="insurance-type" class="form-label">
              Insurance Type
              <span class="text-error">*</span>
            </label>

            <InputText
              id="insurance-type"
              v-model="form.insuranceType"
              required
              placeholder="Enter insurance type"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="enterprise-covered" class="form-label">
              Enterprise Covered
              <span class="text-muted-text">(Optional)</span>
            </label>

            <InputText
              id="enterprise-covered"
              v-model="form.enterpriseCovered"
              placeholder="Enter enterprise covered"
              class="form-input"
            />
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

      <Divider />

      <!-- Notes -->
      <section>
        <div class="mb-4 flex items-start gap-2">
          <FileText class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Additional Notes</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Add any additional information about the cooperative.
            </p>
          </div>
        </div>

        <div class="form-field">
          <label for="notes" class="form-label">
            Notes
            <span class="text-muted-text">(Optional)</span>
          </label>

          <Textarea
            id="notes"
            v-model="form.notes"
            rows="3"
            auto-resize
            placeholder="Enter additional notes"
            class="form-input"
          />
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
  Global selectors ensure that the theme styles reach the rendered modal.
*/

:global(.cooperative-dialog.p-dialog) {
  overflow: hidden;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.875rem !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
  box-shadow: 0 20px 45px rgb(0 0 0 / 18%) !important;
}

:global(.cooperative-dialog .p-dialog-header),
:global(.cooperative-dialog .p-dialog-content),
:global(.cooperative-dialog .p-dialog-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-dialog .p-dialog-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.cooperative-dialog .p-dialog-content) {
  max-height: min(72vh, 780px);
  overflow-y: auto;
  padding: 1.5rem !important;
}

:global(.cooperative-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.cooperative-dialog .p-divider.p-divider-horizontal::before) {
  border-top-color: var(--color-border) !important;
}

:global(.cooperative-dialog-mask) {
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

:global(.cooperative-dialog .p-inputtext) {
  padding: 0.7rem 0.8rem !important;
}

:global(.cooperative-dialog textarea.p-inputtextarea) {
  min-height: 5rem;
  resize: vertical;
}

/*
  PrimeVue Select.
*/
:global(.cooperative-dialog .p-select.form-input) {
  display: flex;
  align-items: center;
  padding: 0 !important;
}

:global(.cooperative-dialog .p-select.form-input:hover) {
  border-color: var(--color-primary) !important;
}

:global(.cooperative-dialog .p-select.form-input.p-focus) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent) !important;
}

:global(.cooperative-dialog .p-select-label) {
  padding: 0.7rem 0.8rem !important;
  color: var(--color-heading) !important;
  font-size: 0.875rem !important;
}

:global(.cooperative-dialog .p-select-label.p-placeholder) {
  color: var(--color-muted-text) !important;
}

:global(.cooperative-dialog .p-select-dropdown),
:global(.cooperative-dialog .p-select-clear-icon) {
  color: var(--color-secondary-text) !important;
}

/*
  PrimeVue toggle switch.
*/
:global(.cooperative-dialog .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background-color: var(--color-primary) !important;
}

:global(.cooperative-dialog .p-toggleswitch:not(.p-disabled):hover .p-toggleswitch-slider) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent) !important;
}

/*
  Modal buttons.
*/
:global(.cooperative-dialog .modal-icon-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-dialog .modal-icon-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-dialog .modal-secondary-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-dialog .modal-secondary-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-dialog .modal-primary-button.p-button) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-dialog .modal-primary-button.p-button:hover) {
  border-color: var(--color-primary-hover) !important;
  background-color: var(--color-primary-hover) !important;
}
</style>
