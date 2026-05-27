<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <span :class="cn('yesml-auto yestext-xs yestracking-widest yesopacity-60', props.class)">
    <slot />
  </span>
</template>
