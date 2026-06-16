<script setup lang="ts">
import type { DropdownMenuSubContentEmits, DropdownMenuSubContentProps } from 'radix-vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { DropdownMenuSubContent, useForwardPropsEmits } from 'radix-vue';
import { computed } from 'vue';

const props = defineProps<DropdownMenuSubContentProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<DropdownMenuSubContentEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DropdownMenuSubContent
    v-bind="forwarded"
    :class="
      cn(
        'yesz-50 yesmin-w-32 yesoverflow-hidden yesrounded-md yesborder yesbg-popover yesp-1 yestext-popover-foreground yesshadow-lg data-[state=open]:yesanimate-in data-[state=closed]:yesanimate-out data-[state=closed]:yesfade-out-0 data-[state=open]:yesfade-in-0 data-[state=closed]:yeszoom-out-95 data-[state=open]:yeszoom-in-95 data-[side=bottom]:yesslide-in-from-top-2 data-[side=left]:yesslide-in-from-right-2 data-[side=right]:yesslide-in-from-left-2 data-[side=top]:yesslide-in-from-bottom-2',
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuSubContent>
</template>
