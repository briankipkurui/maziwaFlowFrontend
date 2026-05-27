<script setup lang="ts">
import type { DropdownMenuSubTriggerProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-vue-next'
import {
  DropdownMenuSubTrigger,

  useForwardProps,
} from 'radix-vue'
import { computed } from 'vue'

const props = defineProps<DropdownMenuSubTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuSubTrigger
    v-bind="forwardedProps"
    :class="cn(
      'yesflex yescursor-default yesselect-none yesitems-center yesrounded-sm yespx-2 yespy-1.5 yestext-sm yesoutline-none focus:yesbg-accent data-[state=open]:yesbg-accent',
      props.class,
    )"
  >
    <slot />
    <ChevronRight class="yesml-auto yesh-4 yesw-4" />
  </DropdownMenuSubTrigger>
</template>
