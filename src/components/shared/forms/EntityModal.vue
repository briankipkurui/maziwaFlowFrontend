<script setup lang="ts">
import { X } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    submitLabel?: string;
    submittingLabel?: string;
    isSubmitting?: boolean;
    maxWidth?: string;
  }>(),
  {
    description: '',
    submitLabel: 'Save',
    submittingLabel: 'Saving...',
    isSubmitting: false,
    maxWidth: 'max-w-4xl',
  },
);

const emit = defineEmits<{
  close: [];
  submit: [];
}>();
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !value && emit('close')">
    <DialogContent
      class="max-h-[92vh] overflow-y-auto rounded-xl border-border bg-card p-0 text-card-foreground shadow-xl"
      :class="maxWidth"
    >
      <DialogHeader class="border-b border-border px-6 py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="text-xl font-bold text-heading">
              {{ title }}
            </DialogTitle>

            <DialogDescription v-if="description" class="mt-1 text-sm text-muted-text">
              {{ description }}
            </DialogDescription>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-text transition-colors hover:bg-surface hover:text-heading"
            aria-label="Close modal"
            @click="emit('close')"
          >
            <X class="h-5 w-5" :stroke-width="2" />
          </button>
        </div>
      </DialogHeader>

      <form @submit.prevent="emit('submit')">
        <div class="grid gap-6 px-6 py-5">
          <slot />
        </div>

        <DialogFooter class="border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            class="h-10 cursor-pointer rounded-lg border-border bg-surface px-5 text-sm font-semibold text-secondary-text shadow-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
            :disabled="isSubmitting"
            @click="emit('close')"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            class="h-10 cursor-pointer rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-none transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? submittingLabel : submitLabel }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
