<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold mb-2">Cooperative</h1>
    <p class="text-sm text-gray-600 mb-4">Viewing cooperative with id: <strong>{{ coopId }}</strong></p>

    <div v-if="loading">Loading cooperative data...</div>
    <div v-else-if="error" class="text-red-600">Error: {{ error }}</div>
    <div v-else>
      <pre class="bg-gray-100 p-3 rounded">{{ cooperative }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouteParams } from '@/composables/useRouteParams';

const { coopId } = useRouteParams();

const cooperative = ref<Record<string, any> | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchCooperative(id: string) {
  loading.value = true;
  error.value = null;
  cooperative.value = null;
  try {
    // Placeholder: replace with real API call or composable
    await new Promise((r) => setTimeout(r, 400));
    cooperative.value = { id, name: `Cooperative ${id}`, info: 'Sample data' };
  } catch (err: any) {
    error.value = err?.message ?? String(err);
  } finally {
    loading.value = false;
  }
}

if (coopId.value) fetchCooperative(coopId.value);

watch(coopId, (id) => {
  if (id) fetchCooperative(id);
});
</script>

<style scoped>
/* keep styling minimal; project uses Tailwind */
</style>
