<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <section class="border-t border-border pt-5 first:border-t-0 first:pt-0">
    <div class="mb-4">
      <h3 class="text-sm font-bold text-heading">
        {{ title }}
      </h3>

      <p v-if="description" class="mt-1 text-xs text-muted-text">
        {{ description }}
      </p>
    </div>

    <slot />
  </section>
</template>
