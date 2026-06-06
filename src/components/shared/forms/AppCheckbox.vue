<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox';

defineProps<{
  modelValue: boolean;
  label: string;
  description?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<template>
  <label
    class="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/60"
  >
    <Checkbox
      :model-value="modelValue"
      class="mt-0.5 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      @update:model-value="emit('update:modelValue', Boolean($event))"
    />

    <span>
      <span class="block text-sm font-medium text-body-text">
        {{ label }}
      </span>

      <span v-if="description" class="mt-0.5 block text-xs text-muted-text">
        {{ description }}
      </span>
    </span>
  </label>
</template>
