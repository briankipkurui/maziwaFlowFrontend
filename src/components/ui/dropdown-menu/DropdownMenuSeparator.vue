<script setup lang="ts">
import type { DropdownMenuSeparatorProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import {
  DropdownMenuSeparator,

} from 'radix-vue'
import { computed } from 'vue'

const props = defineProps<DropdownMenuSeparatorProps & {
  class?: HTMLAttributes['class']
}>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <DropdownMenuSeparator v-bind="delegatedProps" :class="cn('yes-mx-1 yesmy-1 yesh-px yesbg-muted', props.class)" />
</template>
