<script setup lang="ts">
import { computed } from 'vue';

import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-vue-next';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    itemName?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDeleting?: boolean;
    errorMessage?: string;
  }>(),
  {
    title: 'Confirm Delete',
    itemName: '',
    message: 'Are you sure you want to delete this record? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    isDeleting: false,
    errorMessage: '',
  },
);

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const dialogMessage = computed(() => {
  if (!props.itemName) {
    return props.message;
  }

  return `Are you sure you want to delete "${props.itemName}"? This action cannot be undone.`;
});

const handleClose = () => {
  if (props.isDeleting) {
    return;
  }

  emit('close');
};

const handleVisibilityChange = (visible: boolean) => {
  if (!visible) {
    handleClose();
  }
};

const handleConfirm = () => {
  if (props.isDeleting) {
    return;
  }

  emit('confirm');
};
</script>

<template>
  <Dialog
    :visible="open"
    modal
    :closable="false"
    :draggable="false"
    :close-on-escape="!isDeleting"
    class="delete-confirm-dialog"
    :style="{ width: 'min(440px, calc(100vw - 2rem))' }"
    :pt="{
      mask: {
        class: 'delete-confirm-dialog-mask',
      },
    }"
    @update:visible="handleVisibilityChange"
  >
    <template #header>
      <div class="flex w-full items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="delete-icon-wrap">
            <AlertTriangle class="h-5 w-5" :stroke-width="2.3" />
          </div>

          <div>
            <h2 class="text-lg font-bold tracking-[-0.02em] text-heading">
              {{ title }}
            </h2>

            <p class="mt-1 text-xs font-medium text-secondary-text">
              Please confirm before proceeding.
            </p>
          </div>
        </div>

        <Button
          type="button"
          severity="secondary"
          text
          rounded
          aria-label="Close delete confirmation"
          class="delete-close-button shrink-0"
          :disabled="isDeleting"
          @click="handleClose"
        >
          <X class="h-4 w-4" :stroke-width="2" />
        </Button>
      </div>
    </template>

    <div class="space-y-4">
      <div class="rounded-xl border border-error/25 bg-error/10 px-4 py-3">
        <p class="text-sm font-semibold leading-6 text-heading">
          {{ dialogMessage }}
        </p>
      </div>

      <p
        v-if="errorMessage"
        class="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs font-semibold text-error"
      >
        {{ errorMessage }}
      </p>
    </div>

    <template #footer>
      <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          severity="secondary"
          outlined
          class="delete-cancel-button"
          :disabled="isDeleting"
          @click="handleClose"
        >
          {{ cancelLabel }}
        </Button>

        <Button
          type="button"
          severity="danger"
          class="delete-confirm-button"
          :disabled="isDeleting"
          @click="handleConfirm"
        >
          <LoaderCircle v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" :stroke-width="2" />

          <Trash2 v-else class="mr-2 h-4 w-4" :stroke-width="2" />

          {{ isDeleting ? 'Deleting...' : confirmLabel }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:global(.delete-confirm-dialog.p-dialog) {
  overflow: hidden;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.875rem !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
  box-shadow: 0 20px 45px rgb(0 0 0 / 18%) !important;
}

:global(.delete-confirm-dialog .p-dialog-header),
:global(.delete-confirm-dialog .p-dialog-content),
:global(.delete-confirm-dialog .p-dialog-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.delete-confirm-dialog .p-dialog-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.delete-confirm-dialog .p-dialog-content) {
  padding: 1.25rem 1.5rem !important;
}

:global(.delete-confirm-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.delete-confirm-dialog-mask) {
  background-color: rgb(0 0 0 / 52%) !important;
  backdrop-filter: blur(2px);
}

.delete-icon-wrap {
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--color-error) 14%, var(--color-card));
  color: var(--color-error);
}

:global(.delete-confirm-dialog .delete-close-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.delete-confirm-dialog .delete-close-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-error) 10%, transparent) !important;
  color: var(--color-error) !important;
}

:global(.delete-confirm-dialog .delete-cancel-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.delete-confirm-dialog .delete-cancel-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.delete-confirm-dialog .delete-confirm-button.p-button) {
  border-color: var(--color-error) !important;
  background-color: var(--color-error) !important;
  color: white !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.delete-confirm-dialog .delete-confirm-button.p-button:hover) {
  border-color: var(--color-error) !important;
  background-color: color-mix(in srgb, var(--color-error) 88%, black) !important;
}
</style>
