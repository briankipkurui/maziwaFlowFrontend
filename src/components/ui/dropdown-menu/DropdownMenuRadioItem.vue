<script setup lang="ts">
import type { DropdownMenuRadioItemEmits, DropdownMenuRadioItemProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Circle } from 'lucide-vue-next'
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioItem,

  useForwardPropsEmits,
} from 'radix-vue'
import { computed } from 'vue'

const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes['class'] }>()

const emits = defineEmits<DropdownMenuRadioItemEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DropdownMenuRadioItem
    v-bind="forwarded"
    :class="cn(
      'yesrelative yesflex yescursor-default yesselect-none yesitems-center yesrounded-sm yespy-1.5 yespl-8 yespr-2 yestext-sm yesoutline-none yestransition-colors focus:yesbg-accent focus:yestext-accent-foreground data-[disabled]:yespointer-events-none data-[disabled]:yesopacity-50',
      props.class,
    )"
  >
    <span class="yesabsolute yesleft-2 yesflex yesh-3.5 yesw-3.5 yesitems-center yesjustify-center">
      <DropdownMenuItemIndicator>
        <Circle class="yesh-2 yesw-2 yesfill-current" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>
