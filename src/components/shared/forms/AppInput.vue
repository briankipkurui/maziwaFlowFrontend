<script setup lang="ts">
import { Input } from '@/components/ui/input';

withDefaults(
  defineProps<{
    modelValue?: string | number;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <Input
    :model-value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    class="h-11 rounded-lg border-border bg-surface px-4 text-sm text-body-text shadow-none placeholder:text-muted-text focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
    @update:model-value="emit('update:modelValue', String($event ?? ''))"
  />
</template>
