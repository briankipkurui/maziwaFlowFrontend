<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const isEditMode = computed(() => !!props.union);

const inputClass =
  'h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100';

const form = reactive<CooperativeUnionPayload>({
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

watch(
  () => props.union,
  (union) => {
    form.name = union?.name ?? '';
    form.description = union?.description ?? '';
    form.county = union?.county ?? '';
    form.subCounty = union?.subCounty ?? '';
    form.division = union?.division ?? '';
    form.location = union?.location ?? '';
    form.subLocation = union?.subLocation ?? '';
    form.ward = union?.ward ?? '';
    form.kraPin = union?.kraPin ?? '';
    form.latitude = union?.latitude ?? '';
    form.longitude = union?.longitude ?? '';
    form.altitude = union?.altitude ?? '';
    form.precision = union?.precision ?? '';
  },
  { immediate: true },
);

const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      >
        <Transition name="scale">
          <div
            v-if="open"
            class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div class="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  {{ isEditMode ? 'Update Cooperative Union' : 'Create Cooperative Union' }}
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  Fill in the cooperative union details below.
                </p>
              </div>

              <button
                type="button"
                class="rounded-full px-3 py-1 text-xl font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                @click="emit('close')"
              >
                ×
              </button>
            </div>

            <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="handleSubmit">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Union Name
                </label>
                <Input v-model="form.name" :class="inputClass" placeholder="Enter union name" />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  KRA PIN
                </label>
                <Input v-model="form.kraPin" :class="inputClass" placeholder="Enter KRA PIN" />
              </div>

              <div class="space-y-1.5 sm:col-span-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Description
                </label>
                <Input
                  v-model="form.description"
                  :class="inputClass"
                  placeholder="Enter description"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >County</label
                >
                <Input v-model="form.county" :class="inputClass" placeholder="Enter county" />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Sub County</label
                >
                <Input
                  v-model="form.subCounty"
                  :class="inputClass"
                  placeholder="Enter sub county"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Division</label
                >
                <Input v-model="form.division" :class="inputClass" placeholder="Enter division" />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Location</label
                >
                <Input v-model="form.location" :class="inputClass" placeholder="Enter location" />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Sub Location</label
                >
                <Input
                  v-model="form.subLocation"
                  :class="inputClass"
                  placeholder="Enter sub location"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Ward</label
                >
                <Input v-model="form.ward" :class="inputClass" placeholder="Enter ward" />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Latitude</label
                >
                <Input v-model="form.latitude" :class="inputClass" placeholder="Enter latitude" />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Longitude</label
                >
                <Input v-model="form.longitude" :class="inputClass" placeholder="Enter longitude" />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Altitude</label
                >
                <Input v-model="form.altitude" :class="inputClass" placeholder="Enter altitude" />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >Precision</label
                >
                <Input v-model="form.precision" :class="inputClass" placeholder="Enter precision" />
              </div>

              <div class="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  class="h-10 rounded-xl border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  @click="emit('close')"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  class="h-10 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create' }}
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
  transition: all 0.25s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
