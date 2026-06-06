<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { ChevronDown, ChevronUp, Search, X } from 'lucide-vue-next';

import AppCheckbox from '@/components/shared/forms/AppCheckbox.vue';
import AppFormField from '@/components/shared/forms/AppFormField.vue';
import AppInput from '@/components/shared/forms/AppInput.vue';
import AppTextarea from '@/components/shared/forms/AppTextarea.vue';
import EntityModal from '@/components/shared/forms/EntityModal.vue';
import FormSection from '@/components/shared/forms/FormSection.vue';

import { useCooperativeUnionsQuery } from '@/features/cooperativeUnion/composables/queries/useCooperativeUnionsQuery';

import type { CooperativeUnion } from '@/features/cooperativeUnion/types/cooperativeUnion';

import type { Cooperative, CooperativePayload } from '../types/cooperative';

const props = defineProps<{
  open: boolean;
  cooperative?: Cooperative | null;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativePayload];
}>();

const isEditMode = computed(() => Boolean(props.cooperative));

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

const unionSearch = ref('');
const selectedUnionName = ref('');
const isUnionDropdownOpen = ref(false);

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

const cooperativeUnions = computed(() => cooperativeUnionData.value?.results ?? []);

const selectedUnionLabel = computed(() => {
  if (!form.cooperativeUnionId) {
    return 'No cooperative union selected';
  }

  if (selectedUnionName.value) {
    return selectedUnionName.value;
  }

  const selectedUnion = cooperativeUnions.value.find(
    (union) => union.id === form.cooperativeUnionId,
  );

  return selectedUnion?.name ?? `Selected union: ${form.cooperativeUnionId}`;
});

const resetForm = () => {
  Object.assign(form, createEmptyForm());

  unionSearch.value = '';
  selectedUnionName.value = '';
  isUnionDropdownOpen.value = false;
};

const populateForm = (cooperative?: Cooperative | null) => {
  resetForm();

  if (!cooperative) return;

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
    if (!open) return;

    populateForm(props.cooperative);
  },
);

watch(
  () => props.cooperative,
  (cooperative) => {
    if (!props.open) return;

    populateForm(cooperative);
  },
);

watch(
  () => form.hasInsurance,
  (hasInsurance) => {
    if (hasInsurance) return;

    form.insuranceProvider = '';
    form.insuranceType = '';
    form.enterpriseCovered = '';
  },
);

const selectCooperativeUnion = (union: CooperativeUnion) => {
  form.cooperativeUnionId = union.id;
  selectedUnionName.value = union.name;

  unionSearch.value = '';
  isUnionDropdownOpen.value = false;
};

const clearCooperativeUnion = () => {
  form.cooperativeUnionId = undefined;

  selectedUnionName.value = '';
  unionSearch.value = '';
  isUnionDropdownOpen.value = false;
};

const handleClose = () => {
  isUnionDropdownOpen.value = false;
  emit('close');
};

const handleSubmit = () => {
  emit('submit', {
    ...form,
    cooperativeUnionId: form.cooperativeUnionId?.trim() || undefined,
  });
};
</script>

<template>
  <EntityModal
    :open="open"
    :title="isEditMode ? 'Update Cooperative' : 'Create Cooperative'"
    description="Enter the cooperative registration, location and operational details."
    :submit-label="isEditMode ? 'Update Cooperative' : 'Create Cooperative'"
    :is-submitting="isSubmitting"
    max-width="max-w-5xl"
    @close="handleClose"
    @submit="handleSubmit"
  >
    <!-- Basic Information -->
    <FormSection
      title="Basic Information"
      description="Capture the primary registration and contact details."
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AppFormField label="Cooperative Code">
          <AppInput v-model="form.code" placeholder="Enter cooperative code" required />
        </AppFormField>

        <AppFormField label="Cooperative Name" class="sm:col-span-2">
          <AppInput v-model="form.groupName" placeholder="Enter cooperative name" required />
        </AppFormField>

        <AppFormField label="Mobile Phone">
          <AppInput
            v-model="form.mobilePhone"
            type="tel"
            placeholder="Enter mobile phone"
            required
          />
        </AppFormField>

        <AppFormField label="KRA PIN">
          <AppInput v-model="form.kraPin" placeholder="Enter KRA PIN" required />
        </AppFormField>

        <AppFormField label="Incorporation Number" optional>
          <AppInput v-model="form.incorporationNumber" placeholder="Enter incorporation number" />
        </AppFormField>

        <AppFormField label="Image URL" optional>
          <AppInput v-model="form.imgUrl" type="url" placeholder="Enter image URL" />
        </AppFormField>

        <AppFormField label="Main Activity" optional>
          <AppInput v-model="form.mainActivity" placeholder="Enter main activity" />
        </AppFormField>
      </div>
    </FormSection>

    <!-- Cooperative Union -->
    <FormSection
      title="Cooperative Union"
      description="Assign the cooperative to a union where applicable."
    >
      <AppFormField
        label="Cooperative Union"
        optional
        hint="Leave this blank when the cooperative does not belong to any union."
      >
        <div class="relative">
          <button
            type="button"
            class="flex h-11 w-full items-center justify-between rounded-lg border border-border bg-surface px-4 text-left text-sm shadow-none transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            :aria-expanded="isUnionDropdownOpen"
            @click="isUnionDropdownOpen = !isUnionDropdownOpen"
          >
            <span
              class="truncate"
              :class="form.cooperativeUnionId ? 'text-body-text' : 'text-muted-text'"
            >
              {{ selectedUnionLabel }}
            </span>

            <ChevronUp
              v-if="isUnionDropdownOpen"
              class="h-4 w-4 shrink-0 text-muted-text"
              :stroke-width="2"
            />

            <ChevronDown v-else class="h-4 w-4 shrink-0 text-muted-text" :stroke-width="2" />
          </button>

          <!-- Searchable Union Dropdown -->
          <div
            v-if="isUnionDropdownOpen"
            class="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
          >
            <div class="border-b border-border p-3">
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text"
                  :stroke-width="2"
                />

                <AppInput
                  v-model="unionSearch"
                  placeholder="Search cooperative unions"
                  class="pl-9"
                  @click.stop
                />
              </div>
            </div>

            <div class="max-h-64 overflow-y-auto p-2">
              <button
                v-if="form.cooperativeUnionId"
                type="button"
                class="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-error transition-colors hover:bg-error/10"
                @click="clearCooperativeUnion"
              >
                <X class="h-4 w-4" :stroke-width="2" />

                Remove Selected Union
              </button>

              <p
                v-if="isLoadingCooperativeUnions"
                class="px-3 py-4 text-center text-sm text-muted-text"
              >
                Loading cooperative unions...
              </p>

              <p
                v-else-if="isCooperativeUnionError"
                class="px-3 py-4 text-center text-sm text-error"
              >
                Failed to load cooperative unions.
              </p>

              <template v-else>
                <button
                  v-for="union in cooperativeUnions"
                  :key="union.id"
                  type="button"
                  class="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-primary/10"
                  :class="
                    form.cooperativeUnionId === union.id
                      ? 'bg-primary/10 ring-1 ring-primary/20'
                      : ''
                  "
                  @click="selectCooperativeUnion(union)"
                >
                  <span class="text-sm font-semibold text-heading">
                    {{ union.name }}
                  </span>

                  <span class="mt-0.5 text-xs text-muted-text">
                    {{ union.county || 'County not specified' }}

                    <template v-if="union.kraPin"> · {{ union.kraPin }} </template>
                  </span>
                </button>

                <p
                  v-if="cooperativeUnions.length === 0"
                  class="px-3 py-4 text-center text-sm text-muted-text"
                >
                  No cooperative unions found.
                </p>
              </template>
            </div>
          </div>
        </div>
      </AppFormField>
    </FormSection>

    <!-- Location -->
    <FormSection
      title="Location Details"
      description="Capture the cooperative's administrative location."
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AppFormField label="County">
          <AppInput v-model="form.county" placeholder="Enter county" required />
        </AppFormField>

        <AppFormField label="Sub County" optional>
          <AppInput v-model="form.subCounty" placeholder="Enter sub county" />
        </AppFormField>

        <AppFormField label="Division" optional>
          <AppInput v-model="form.division" placeholder="Enter division" />
        </AppFormField>

        <AppFormField label="Location" optional>
          <AppInput v-model="form.location" placeholder="Enter location" />
        </AppFormField>

        <AppFormField label="Sub Location" optional>
          <AppInput v-model="form.subLocation" placeholder="Enter sub location" />
        </AppFormField>

        <AppFormField label="Ward" optional>
          <AppInput v-model="form.ward" placeholder="Enter ward" />
        </AppFormField>
      </div>
    </FormSection>

    <!-- Insurance -->
    <FormSection
      title="Insurance Details"
      description="Record insurance information where the cooperative has active coverage."
    >
      <AppCheckbox
        v-model="form.hasInsurance"
        label="This cooperative has insurance coverage"
        description="Enable this option to capture the insurance provider and coverage details."
      />

      <div v-if="form.hasInsurance" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AppFormField label="Insurance Provider">
          <AppInput v-model="form.insuranceProvider" placeholder="Enter insurance provider" />
        </AppFormField>

        <AppFormField label="Insurance Type">
          <AppInput v-model="form.insuranceType" placeholder="Enter insurance type" />
        </AppFormField>

        <AppFormField label="Enterprise Covered">
          <AppInput v-model="form.enterpriseCovered" placeholder="Enter enterprise covered" />
        </AppFormField>
      </div>
    </FormSection>

    <!-- Coordinates -->
    <FormSection title="Coordinates" description="Capture GPS values where they are available.">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AppFormField label="Latitude" optional>
          <AppInput v-model="form.latitude" placeholder="Latitude" />
        </AppFormField>

        <AppFormField label="Longitude" optional>
          <AppInput v-model="form.longitude" placeholder="Longitude" />
        </AppFormField>

        <AppFormField label="Altitude" optional>
          <AppInput v-model="form.altitude" placeholder="Altitude" />
        </AppFormField>

        <AppFormField label="Precision" optional>
          <AppInput v-model="form.precision" placeholder="Precision" />
        </AppFormField>
      </div>
    </FormSection>

    <!-- Notes -->
    <FormSection title="Additional Notes">
      <AppFormField label="Notes" optional>
        <AppTextarea v-model="form.notes" placeholder="Enter any additional notes" :rows="4" />
      </AppFormField>
    </FormSection>
  </EntityModal>
</template>
