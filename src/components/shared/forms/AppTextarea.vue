<script setup lang="ts">
import { Textarea } from '@/components/ui/textarea';

withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
  }>(),
  {
    modelValue: '',
    placeholder: '',
    required: false,
    disabled: false,
    rows: 4,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <Textarea
    :model-value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :rows="rows"
    class="min-h-24 resize-y rounded-lg border-border bg-surface px-4 py-3 text-sm text-body-text shadow-none placeholder:text-muted-text focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
    @update:model-value="emit('update:modelValue', String($event ?? ''))"
  />
</template>