<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
  BadgeCheck,
  FileText,
  KeyRound,
  LoaderCircle,
  Save,
  ShieldCheck,
  X,
} from 'lucide-vue-next';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Textarea from 'primevue/textarea';

import { useCooperativeMemberRolePermissionsQuery } from '../composables/queries/cooperativeMemberRoleQueries';
import type { CooperativeMemberRole, CooperativeMemberRolePayload } from '../types/cooperativeMemberRoleTypes';

// import type {
//   CooperativeMemberRole,
//   CooperativeMemberRolePayload,
// } from '../types/cooperativeMemberRole';

const props = withDefaults(
  defineProps<{
    open: boolean;
    role?: CooperativeMemberRole | null;
    isSubmitting?: boolean;
  }>(),
  {
    role: null,
    isSubmitting: false,
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativeMemberRolePayload];
}>();

const { data: permissionsData, isLoading: isLoadingPermissions } =
  useCooperativeMemberRolePermissionsQuery();

const isEditMode = computed(() => Boolean(props.role));

const dialogTitle = computed(() =>
  isEditMode.value ? 'Update Cooperative Member Role' : 'Create Cooperative Member Role',
);

const submitLabel = computed(() => (isEditMode.value ? 'Update Role' : 'Create Role'));

const permissionOptions = computed(() =>
  (permissionsData.value ?? []).map((permission) => ({
    label: formatPermissionName(permission.name),
    value: permission.id,
    description: permission.description,
    name: permission.name,
  })),
);

const selectedPermissionsCount = computed(() => form.permissionIds?.length ?? 0);

const createEmptyForm = (): CooperativeMemberRolePayload => ({
  name: '',
  description: '',
  permissionIds: [],
});

const form = reactive<CooperativeMemberRolePayload>(createEmptyForm());

const resetForm = () => {
  Object.assign(form, createEmptyForm());
};

const populateForm = (role?: CooperativeMemberRole | null) => {
  resetForm();

  if (!role) {
    return;
  }

  Object.assign(form, {
    name: role.name ?? '',
    description: role.description ?? '',
    permissionIds: role.permissions?.map((permission) => permission.id) ?? [],
  });
};

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return;
    }

    populateForm(props.role);
  },
);

watch(
  () => props.role,
  (role) => {
    if (!props.open) {
      return;
    }

    populateForm(role);
  },
);

function formatPermissionName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const handleClose = () => {
  if (props.isSubmitting) {
    return;
  }

  emit('close');
};

const handleVisibilityChange = (visible: boolean) => {
  if (!visible) {
    handleClose();
  }
};

const handleSubmit = () => {
  emit('submit', {
    name: form.name.trim(),
    description: form.description?.trim() || null,
    permissionIds: form.permissionIds ?? [],
  });
};
</script>

<template>
  <Dialog
    :visible="open"
    modal
    dismissable-mask
    :draggable="false"
    :closable="false"
    :close-on-escape="!isSubmitting"
    class="cooperative-member-role-dialog"
    :style="{ width: 'min(860px, calc(100vw - 2rem))' }"
    :pt="{
      mask: {
        class: 'cooperative-member-role-dialog-mask',
      },
    }"
    @update:visible="handleVisibilityChange"
  >
    <!-- Header -->
    <template #header>
      <div class="flex w-full items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold tracking-[-0.02em] text-heading">
            {{ dialogTitle }}
          </h2>

          <p class="mt-1 text-sm leading-6 text-secondary-text">
            Create roles and assign permissions that control what cooperative members can access.
          </p>
        </div>

        <Button
          type="button"
          severity="secondary"
          text
          rounded
          aria-label="Close modal"
          class="modal-icon-button shrink-0"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          <X class="h-5 w-5" :stroke-width="2" />
        </Button>
      </div>
    </template>

    <form id="cooperative-member-role-form" class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Role Details -->
      <section>
        <div class="mb-4 flex items-start gap-2">
          <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Role Details</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Provide the role name and a short description of what the role is used for.
            </p>
          </div>
        </div>

        <div class="grid gap-4">
          <div class="form-field">
            <label for="role-name" class="form-label">
              Role Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="role-name"
              v-model="form.name"
              required
              placeholder="Example: Cooperative Admin"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="role-description" class="form-label">
              Description
              <span class="text-muted-text">(Optional)</span>
            </label>

            <Textarea
              id="role-description"
              v-model="form.description"
              rows="4"
              auto-resize
              placeholder="Briefly describe this role"
              class="form-input"
            />
          </div>
        </div>
      </section>

      <Divider />

      <!-- Permissions -->
      <section>
        <div class="mb-4 flex items-start gap-2">
          <KeyRound class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Role Permissions</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Select the permissions that should be granted to members with this role.
            </p>
          </div>
        </div>

        <div class="grid gap-4">
          <div class="form-field">
            <label for="role-permissions" class="form-label">
              Permissions
              <span class="text-muted-text">(Optional)</span>
            </label>

            <MultiSelect
              id="role-permissions"
              v-model="form.permissionIds"
              :options="permissionOptions"
              option-label="label"
              option-value="value"
              display="chip"
              filter
              :loading="isLoadingPermissions"
              :disabled="isSubmitting || isLoadingPermissions"
              placeholder="Select permissions"
              class="form-input"
              append-to="self"
            >
              <template #option="{ option }">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-heading">
                    {{ option.label }}
                  </p>

                  <p class="mt-0.5 text-xs text-secondary-text">
                    {{ option.description || option.name }}
                  </p>
                </div>
              </template>
            </MultiSelect>

            <p class="text-xs leading-5 text-secondary-text">
              {{ selectedPermissionsCount }}
              {{ selectedPermissionsCount === 1 ? 'permission selected' : 'permissions selected' }}.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <!-- Summary -->
      <section>
        <div class="flex items-start gap-2">
          <FileText class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Role Summary</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              This role will be available for assignment to cooperative members once saved.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <!-- Before Saving -->
      <section>
        <div class="flex items-start gap-2">
          <BadgeCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Before Saving</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Confirm that the role name and selected permissions are correct before submitting.
            </p>
          </div>
        </div>
      </section>
    </form>

    <!-- Footer -->
    <template #footer>
      <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          severity="secondary"
          outlined
          class="modal-secondary-button"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          form="cooperative-member-role-form"
          class="modal-primary-button"
          :disabled="isSubmitting"
        >
          <LoaderCircle v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" :stroke-width="2" />

          <Save v-else class="mr-2 h-4 w-4" :stroke-width="2" />

          {{ isSubmitting ? 'Saving...' : submitLabel }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:global(.cooperative-member-role-dialog.p-dialog) {
  overflow: hidden;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.875rem !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
  box-shadow: 0 20px 45px rgb(0 0 0 / 18%) !important;
}

:global(.cooperative-member-role-dialog .p-dialog-header),
:global(.cooperative-member-role-dialog .p-dialog-content),
:global(.cooperative-member-role-dialog .p-dialog-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-member-role-dialog .p-dialog-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.cooperative-member-role-dialog .p-dialog-content) {
  max-height: min(72vh, 720px);
  overflow-y: auto;
  padding: 1.5rem !important;
}

:global(.cooperative-member-role-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.cooperative-member-role-dialog .p-divider.p-divider-horizontal::before) {
  border-top-color: var(--color-border) !important;
}

:global(.cooperative-member-role-dialog-mask) {
  background-color: rgb(0 0 0 / 52%) !important;
  backdrop-filter: blur(2px);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-label {
  color: var(--color-secondary-text);
  font-size: 0.75rem;
  font-weight: 700;
}

.form-input {
  width: 100%;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.5rem !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
  font-size: 0.875rem !important;
  box-shadow: none !important;
}

.form-input::placeholder {
  color: var(--color-muted-text) !important;
}

.form-input:enabled:hover {
  border-color: var(--color-primary) !important;
}

.form-input:enabled:focus {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent) !important;
}

:global(.cooperative-member-role-dialog .p-inputtext),
:global(.cooperative-member-role-dialog .p-textarea) {
  padding: 0.7rem 0.8rem !important;
}

:global(.cooperative-member-role-dialog .p-multiselect.form-input) {
  display: flex;
  align-items: center;
  padding: 0 !important;
}

:global(.cooperative-member-role-dialog .p-multiselect.form-input:hover) {
  border-color: var(--color-primary) !important;
}

:global(.cooperative-member-role-dialog .p-multiselect.form-input.p-focus) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent) !important;
}

:global(.cooperative-member-role-dialog .p-multiselect-label) {
  padding: 0.7rem 0.8rem !important;
  color: var(--color-heading) !important;
  font-size: 0.875rem !important;
}

:global(.cooperative-member-role-dialog .p-multiselect-label.p-placeholder) {
  color: var(--color-muted-text) !important;
}

:global(.cooperative-member-role-dialog .p-multiselect-dropdown) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-member-role-dialog .modal-icon-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-member-role-dialog .modal-icon-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-member-role-dialog .modal-secondary-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-member-role-dialog .modal-secondary-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-member-role-dialog .modal-primary-button.p-button) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-member-role-dialog .modal-primary-button.p-button:hover) {
  border-color: var(--color-primary-hover) !important;
  background-color: var(--color-primary-hover) !important;
}
</style>
