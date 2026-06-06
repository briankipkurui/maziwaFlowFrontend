<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import AppFormField from '@/components/shared/forms/AppFormField.vue';
import AppInput from '@/components/shared/forms/AppInput.vue';
import EntityModal from '@/components/shared/forms/EntityModal.vue';
import FormSection from '@/components/shared/forms/FormSection.vue';

import type { CooperativeUnion, CooperativeUnionPayload } from '../types/cooperativeUnion';

const props = defineProps<{
  open: boolean;
  union?: CooperativeUnion | null;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativeUnionPayload];
}>();

const isEditMode = computed(() => Boolean(props.union));

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

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>

<template>
  <EntityModal
    :open="open"
    :title="isEditMode ? 'Update Cooperative Union' : 'Create Cooperative Union'"
    description="Enter the cooperative union registration, location and coordinate details."
    :submit-label="isEditMode ? 'Update Union' : 'Create Union'"
    :is-submitting="isSubmitting"
    max-width="max-w-4xl"
    @close="emit('close')"
    @submit="handleSubmit"
  >
    <!-- Basic Information -->
    <FormSection
      title="Basic Information"
      description="Capture the union name, registration details and description."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <AppFormField label="Union Name">
          <AppInput v-model="form.name" placeholder="Enter union name" required />
        </AppFormField>

        <AppFormField label="KRA PIN">
          <AppInput v-model="form.kraPin" placeholder="Enter KRA PIN" required />
        </AppFormField>

        <AppFormField label="Description" optional class="sm:col-span-2">
          <AppInput v-model="form.description" placeholder="Enter description" />
        </AppFormField>
      </div>
    </FormSection>

    <!-- Location -->
    <FormSection
      title="Location Details"
      description="Capture the administrative location of the cooperative union."
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
  </EntityModal>
</template>
