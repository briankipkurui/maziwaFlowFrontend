<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// import { useCooperativeUnionsQuery } from '../composables/queries/cooperativeUnionQueries';

import type { Cooperative, CooperativePayload } from '../types/cooperative';
import { useCooperativeUnionsQuery } from '@/features/cooperativeUnion/composables/queries/useCooperativeUnionsQuery';
import type { CooperativeUnion } from '@/features/cooperativeUnion/types/cooperativeUnion';

// import type { CooperativeUnion } from '../types/cooperativeUnion';

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

const inputClass =
  'h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100';

const textareaClass =
  'min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100';

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
                  {{ isEditMode ? 'Update Cooperative' : 'Create Cooperative' }}
                </h2>

                <p class="mt-1 text-sm text-slate-500">
                  Enter the cooperative registration, location and operational details below.
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
                <h3 class="mb-3 text-sm font-bold text-slate-800">Basic Information</h3>

                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Cooperative Code
                    </label>

                    <Input
                      v-model="form.code"
                      :class="inputClass"
                      placeholder="Enter cooperative code"
                      required
                    />
                  </div>

                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Cooperative Name
                    </label>

                    <Input
                      v-model="form.groupName"
                      :class="inputClass"
                      placeholder="Enter cooperative name"
                      required
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Mobile Phone
                    </label>

                    <Input
                      v-model="form.mobilePhone"
                      type="tel"
                      :class="inputClass"
                      placeholder="Enter mobile phone"
                      required
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      KRA PIN
                    </label>

                    <Input
                      v-model="form.kraPin"
                      :class="inputClass"
                      placeholder="Enter KRA PIN"
                      required
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Incorporation Number
                    </label>

                    <Input
                      v-model="form.incorporationNumber"
                      :class="inputClass"
                      placeholder="Enter incorporation number"
                    />
                  </div>

                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Cooperative Union
                      <span class="normal-case tracking-normal text-slate-400"> (Optional) </span>
                    </label>

                    <div class="relative">
                      <button
                        type="button"
                        class="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-sm shadow-sm transition hover:border-green-300 hover:bg-white focus:border-green-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                        :aria-expanded="isUnionDropdownOpen"
                        @click="isUnionDropdownOpen = !isUnionDropdownOpen"
                      >
                        <span
                          :class="form.cooperativeUnionId ? 'text-slate-800' : 'text-slate-400'"
                        >
                          {{ selectedUnionLabel }}
                        </span>

                        <span class="text-xs text-slate-400">
                          {{ isUnionDropdownOpen ? '▲' : '▼' }}
                        </span>
                      </button>

                      <div
                        v-if="isUnionDropdownOpen"
                        class="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                      >
                        <div class="border-b border-slate-100 p-3">
                          <Input
                            v-model="unionSearch"
                            :class="inputClass"
                            placeholder="Search cooperative unions"
                            @click.stop
                          />
                        </div>

                        <div class="max-h-64 overflow-y-auto p-2">
                          <button
                            v-if="form.cooperativeUnionId"
                            type="button"
                            class="mb-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                            @click="clearCooperativeUnion"
                          >
                            Remove Selected Union
                          </button>

                          <p
                            v-if="isLoadingCooperativeUnions"
                            class="px-3 py-4 text-center text-sm text-slate-500"
                          >
                            Loading cooperative unions...
                          </p>

                          <p
                            v-else-if="isCooperativeUnionError"
                            class="px-3 py-4 text-center text-sm text-red-600"
                          >
                            Failed to load cooperative unions.
                          </p>

                          <template v-else>
                            <button
                              v-for="union in cooperativeUnions"
                              :key="union.id"
                              type="button"
                              class="flex w-full flex-col rounded-lg px-3 py-2 text-left transition hover:bg-green-50"
                              :class="{
                                'bg-green-50 ring-1 ring-green-100':
                                  form.cooperativeUnionId === union.id,
                              }"
                              @click="selectCooperativeUnion(union)"
                            >
                              <span class="text-sm font-semibold text-slate-800">
                                {{ union.name }}
                              </span>

                              <span class="mt-0.5 text-xs text-slate-500">
                                {{ union.county || 'County not specified' }}

                                <template v-if="union.kraPin"> · {{ union.kraPin }} </template>
                              </span>
                            </button>

                            <p
                              v-if="cooperativeUnions.length === 0"
                              class="px-3 py-4 text-center text-sm text-slate-500"
                            >
                              No cooperative unions found.
                            </p>
                          </template>
                        </div>
                      </div>
                    </div>

                    <p class="text-xs text-slate-400">
                      Leave this blank when the cooperative does not belong to any union.
                    </p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Image URL
                    </label>

                    <Input
                      v-model="form.imgUrl"
                      type="url"
                      :class="inputClass"
                      placeholder="Enter image URL"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Main Activity
                    </label>

                    <Input
                      v-model="form.mainActivity"
                      :class="inputClass"
                      placeholder="Enter main activity"
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
                      v-model="form.county"
                      :class="inputClass"
                      placeholder="Enter county"
                      required
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Sub County
                    </label>

                    <Input
                      v-model="form.subCounty"
                      :class="inputClass"
                      placeholder="Enter sub county"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Division
                    </label>

                    <Input
                      v-model="form.division"
                      :class="inputClass"
                      placeholder="Enter division"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Location
                    </label>

                    <Input
                      v-model="form.location"
                      :class="inputClass"
                      placeholder="Enter location"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Sub Location
                    </label>

                    <Input
                      v-model="form.subLocation"
                      :class="inputClass"
                      placeholder="Enter sub location"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Ward
                    </label>

                    <Input v-model="form.ward" :class="inputClass" placeholder="Enter ward" />
                  </div>
                </div>
              </section>

              <section class="border-t border-slate-100 pt-5">
                <h3 class="mb-3 text-sm font-bold text-slate-800">Insurance Details</h3>

                <label
                  class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <input
                    v-model="form.hasInsurance"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 accent-green-700"
                  />

                  <span class="text-sm font-medium text-slate-700">
                    This cooperative has insurance coverage
                  </span>
                </label>

                <div v-if="form.hasInsurance" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Insurance Provider
                    </label>

                    <Input
                      v-model="form.insuranceProvider"
                      :class="inputClass"
                      placeholder="Enter insurance provider"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Insurance Type
                    </label>

                    <Input
                      v-model="form.insuranceType"
                      :class="inputClass"
                      placeholder="Enter insurance type"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Enterprise Covered
                    </label>

                    <Input
                      v-model="form.enterpriseCovered"
                      :class="inputClass"
                      placeholder="Enter enterprise covered"
                    />
                  </div>
                </div>
              </section>

              <section class="border-t border-slate-100 pt-5">
                <h3 class="mb-3 text-sm font-bold text-slate-800">Coordinates</h3>

                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Latitude
                    </label>

                    <Input
                      v-model="form.latitude"
                      :class="inputClass"
                      placeholder="Enter latitude"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Longitude
                    </label>

                    <Input
                      v-model="form.longitude"
                      :class="inputClass"
                      placeholder="Enter longitude"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Altitude
                    </label>

                    <Input
                      v-model="form.altitude"
                      :class="inputClass"
                      placeholder="Enter altitude"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Precision
                    </label>

                    <Input
                      v-model="form.precision"
                      :class="inputClass"
                      placeholder="Enter precision"
                    />
                  </div>
                </div>
              </section>

              <section class="border-t border-slate-100 pt-5">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Notes
                  </label>

                  <textarea
                    v-model="form.notes"
                    :class="textareaClass"
                    placeholder="Enter any additional notes"
                  />
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
                  {{
                    isSubmitting
                      ? 'Saving...'
                      : isEditMode
                        ? 'Update Cooperative'
                        : 'Create Cooperative'
                  }}
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
