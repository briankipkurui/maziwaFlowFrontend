<script setup lang="ts">
import type { DropdownMenuItemProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { DropdownMenuItem, useForwardProps } from 'radix-vue'
import { computed } from 'vue'

const props = defineProps<DropdownMenuItemProps & { class?: HTMLAttributes['class'], inset?: boolean }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuItem
    v-bind="forwardedProps"
    :class="cn(
      'yesrelative yesflex yescursor-default yesselect-none yesitems-center yesrounded-sm yesgap-2 yespx-2 yespy-1.5 yestext-sm yesoutline-none yestransition-colors focus:yesbg-accent focus:yestext-accent-foreground data-[disabled]:yespointer-events-none data-[disabled]:yesopacity-50 yes [&>svg]:yessize-4 [&>svg]:yesshrink-0',
      inset && 'yespl-8',
      props.class,
    )"
  >
    <slot />
  </DropdownMenuItem>
</template>
