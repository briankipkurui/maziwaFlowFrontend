<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    optional?: boolean;
    hint?: string;
    error?: string;
  }>(),
  {
    optional: false,
    hint: '',
    error: '',
  },
);
</script>

<template>
  <div class="space-y-1.5">
    <label class="block text-xs font-semibold uppercase tracking-wide text-secondary-text">
      {{ label }}

      <span v-if="optional" class="ml-1 normal-case tracking-normal text-muted-text">
        (Optional)
      </span>
    </label>

    <slot />

    <p v-if="error" class="text-xs font-medium text-error">
      {{ error }}
    </p>

    <p v-else-if="hint" class="text-xs text-muted-text">
      {{ hint }}
    </p>
  </div>
</template>
