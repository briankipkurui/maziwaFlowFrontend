<script setup lang="ts">
import type { DropdownMenuCheckboxItemEmits, DropdownMenuCheckboxItemProps } from 'radix-vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-vue-next';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItemIndicator,
  useForwardPropsEmits,
} from 'radix-vue';
import { computed } from 'vue';

const props = defineProps<DropdownMenuCheckboxItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<DropdownMenuCheckboxItemEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DropdownMenuCheckboxItem
    v-bind="forwarded"
    :class="
      cn(
        'yesrelative yesflex yescursor-default yesselect-none yesitems-center yesrounded-sm yespy-1.5 yespl-8 yespr-2 yestext-sm yesoutline-none yestransition-colors focus:yesbg-accent focus:yestext-accent-foreground data-[disabled]:yespointer-events-none data-[disabled]:yesopacity-50',
        props.class,
      )
    "
  >
    <span class="yesabsolute yesleft-2 yesflex yesh-3.5 yesw-3.5 yesitems-center yesjustify-center">
      <DropdownMenuItemIndicator>
        <Check class="yesw-4 yesh-4" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuCheckboxItem>
</template>
