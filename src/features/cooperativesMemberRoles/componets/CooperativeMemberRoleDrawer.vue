<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import {
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  FileText,
  KeyRound,
  LoaderCircle,
  Save,
  ShieldCheck,
  X,
} from 'lucide-vue-next';

import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Drawer from 'primevue/drawer';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

import { useCooperativeMemberRolePermissionsQuery } from '../composables/queries/cooperativeMemberRoleQueries';
import type {
  CooperativeMemberRole,
  CooperativeMemberRolePayload,
} from '../types/cooperativeMemberRoleTypes';

import type { FieldErrors } from '@/utils/formErrors';

const props = withDefaults(
  defineProps<{
    open: boolean;
    role?: CooperativeMemberRole | null;
    isSubmitting?: boolean;
    serverErrors?: FieldErrors;
    generalError?: string;
  }>(),
  {
    role: null,
    isSubmitting: false,
    serverErrors: () => ({}),
    generalError: '',
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: CooperativeMemberRolePayload];
}>();

type PermissionOption = {
  label: string;
  value: string;
  description?: string | null;
  name: string;
  category: string;
};

type PermissionGroup = {
  category: string;
  options: PermissionOption[];
};

const { data: permissionsData, isLoading: isLoadingPermissions } =
  useCooperativeMemberRolePermissionsQuery();

const currentStep = ref(0);

const expandedCategories = reactive<Record<string, boolean>>({});

const steps = [
  {
    label: 'Role Details',
    description: 'Name and description',
  },
  {
    label: 'Permissions',
    description: 'Assign access rights',
  },
  {
    label: 'Review',
    description: 'Confirm and save',
  },
];

const stepErrorFields = [['name', 'description'], ['permissionIds', 'permissions'], ['general']];

const actionOrder = [
  'View',
  'Create',
  'Edit',
  'Update',
  'Delete',
  'Approve',
  'Reject',
  'Post',
  'Export',
  'Import',
  'Audit',
];

const isEditMode = computed(() => Boolean(props.role));

const isFirstStep = computed(() => currentStep.value === 0);

const isLastStep = computed(() => currentStep.value === steps.length - 1);

const drawerTitle = computed(() =>
  isEditMode.value ? 'Update Cooperative Member Role' : 'Create Cooperative Member Role',
);

const submitLabel = computed(() => (isEditMode.value ? 'Update Role' : 'Create Role'));

const currentStepLabel = computed(() => steps[currentStep.value]?.label ?? 'Role Details');

const createEmptyForm = (): CooperativeMemberRolePayload => ({
  name: '',
  description: '',
  permissionIds: [],
});

const form = reactive<CooperativeMemberRolePayload>(createEmptyForm());

const resetForm = () => {
  Object.assign(form, createEmptyForm());
};

function normalizePermissionText(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_./:-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPermissionText(value: string): string {
  return toTitleCase(normalizePermissionText(value));
}

function splitPermissionName(name: string): {
  category: string;
  label: string;
} {
  const cleanName = name?.trim() ?? '';

  if (!cleanName) {
    return {
      category: 'Other',
      label: 'Unnamed Permission',
    };
  }

  const parts = cleanName.split('.').filter(Boolean);

  /**
   * Example:
   * cooperative-member.create.member
   *
   * Category: Cooperative Member
   * Label: Create Member
   */
  if (parts.length >= 2) {
    const [rawCategory, ...rawActionParts] = parts;

    return {
      category: formatPermissionText(rawCategory ?? ''),
      label: formatPermissionText(rawActionParts.join(' ')),
    };
  }

  return {
    category: 'Other',
    label: formatPermissionText(cleanName),
  };
}

function getPermissionCategory(permission: unknown): string {
  const rawPermission = permission as {
    name?: string;
    category?: string | null;
    module?: string | null;
    group?: string | null;
    resource?: string | null;
  };

  const directCategory =
    rawPermission.category || rawPermission.module || rawPermission.group || rawPermission.resource;

  if (directCategory) {
    return formatPermissionText(directCategory);
  }

  return splitPermissionName(rawPermission.name ?? '').category;
}

function formatPermissionLabel(permission: unknown): string {
  const rawPermission = permission as {
    name?: string;
  };

  return splitPermissionName(rawPermission.name ?? '').label;
}

function getActionSortIndex(label: string): number {
  const firstWord = label.split(' ')[0] ?? '';

  const index = actionOrder.findIndex((action) => action.toLowerCase() === firstWord.toLowerCase());

  return index === -1 ? actionOrder.length : index;
}

function sortPermissionsByAction(a: PermissionOption, b: PermissionOption): number {
  const actionA = getActionSortIndex(a.label);
  const actionB = getActionSortIndex(b.label);

  if (actionA !== actionB) {
    return actionA - actionB;
  }

  return a.label.localeCompare(b.label);
}

const permissionOptions = computed<PermissionOption[]>(() =>
  (permissionsData.value ?? []).map((permission) => ({
    label: formatPermissionLabel(permission),
    value: permission.id,
    description: permission.description,
    name: permission.name,
    category: getPermissionCategory(permission),
  })),
);

const permissionGroups = computed<PermissionGroup[]>(() => {
  const groups = new Map<string, PermissionOption[]>();

  for (const permission of permissionOptions.value) {
    if (!groups.has(permission.category)) {
      groups.set(permission.category, []);
    }

    groups.get(permission.category)?.push(permission);
  }

  return Array.from(groups.entries())
    .map(([category, options]) => ({
      category,
      options: options.sort(sortPermissionsByAction),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
});

const selectedPermissionsCount = computed(() => form.permissionIds?.length ?? 0);

const selectedPermissionGroups = computed(() =>
  permissionGroups.value
    .map((group) => ({
      category: group.category,
      options: group.options.filter((permission) => form.permissionIds?.includes(permission.value)),
    }))
    .filter((group) => group.options.length > 0),
);

watch(
  permissionGroups,
  (groups) => {
    for (const group of groups) {
      if (expandedCategories[group.category] === undefined) {
        expandedCategories[group.category] = true;
      }
    }
  },
  {
    immediate: true,
  },
);

const getFieldError = (...fields: string[]): string => {
  for (const field of fields) {
    const error = props.serverErrors?.[field];

    if (error) {
      return error;
    }
  }

  return '';
};

const hasFieldError = (...fields: string[]): boolean => {
  return Boolean(getFieldError(...fields));
};

const hasStepErrors = (stepIndex: number): boolean => {
  return stepErrorFields[stepIndex]?.some((field) => Boolean(props.serverErrors?.[field])) ?? false;
};

const goToStep = (stepIndex: number) => {
  if (props.isSubmitting) {
    return;
  }

  currentStep.value = stepIndex;
};

const goToNextStep = () => {
  if (currentStep.value >= steps.length - 1) {
    return;
  }

  currentStep.value += 1;
};

const goToPreviousStep = () => {
  if (currentStep.value <= 0) {
    return;
  }

  currentStep.value -= 1;
};

const isCategoryExpanded = (category: string): boolean => {
  return expandedCategories[category] ?? true;
};

const toggleCategoryExpansion = (category: string) => {
  expandedCategories[category] = !isCategoryExpanded(category);
};

const isPermissionSelected = (permissionId: string): boolean => {
  return form.permissionIds?.includes(permissionId) ?? false;
};

const updatePermissionIds = (permissionIds: string[]) => {
  /**
   * This only updates the local drawer form.
   * It does NOT call the API.
   */
  form.permissionIds = Array.from(new Set(permissionIds));
};
const togglePermission = (permissionId: string, checked: boolean) => {
  /**
   * Do not call replace permissions endpoint here.
   * Checkbox changes should remain local until the user clicks Update/Create.
   */
  const selectedIds = new Set(form.permissionIds ?? []);

  if (checked) {
    selectedIds.add(permissionId);
  } else {
    selectedIds.delete(permissionId);
  }

  updatePermissionIds(Array.from(selectedIds));
};

const isCategoryFullySelected = (group: PermissionGroup): boolean => {
  return (
    group.options.length > 0 &&
    group.options.every((permission) => isPermissionSelected(permission.value))
  );
};

const isCategoryPartiallySelected = (group: PermissionGroup): boolean => {
  return (
    group.options.some((permission) => isPermissionSelected(permission.value)) &&
    !isCategoryFullySelected(group)
  );
};

const toggleCategoryPermissions = (group: PermissionGroup, checked: boolean) => {
  /**
   * Do not call replace permissions endpoint here.
   * Category checkbox changes should also remain local.
   */
  const selectedIds = new Set(form.permissionIds ?? []);

  for (const permission of group.options) {
    if (checked) {
      selectedIds.add(permission.value);
    } else {
      selectedIds.delete(permission.value);
    }
  }

  updatePermissionIds(Array.from(selectedIds));
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

    currentStep.value = 0;
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

watch(
  () => props.serverErrors,
  (errors) => {
    if (!props.open || !errors) {
      return;
    }

    const errorKeys = Object.keys(errors);

    if (!errorKeys.length) {
      return;
    }

    const firstStepWithError = stepErrorFields.findIndex((fields) =>
      fields.some((field) => errorKeys.includes(field)),
    );

    if (firstStepWithError >= 0) {
      currentStep.value = firstStepWithError;
    }
  },
  {
    deep: true,
  },
);

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
  /**
   * The drawer only emits the final selected permissionIds.
   * The parent decides when to call the API.
   */
  emit('submit', {
    name: form.name.trim(),
    description: form.description?.trim() || null,
    permissionIds: form.permissionIds ?? [],
  });
};
</script>

<template>
  <Drawer
    :visible="open"
    position="right"
    modal
    block-scroll
    :dismissable="!isSubmitting"
    :show-close-icon="false"
    class="cooperative-member-role-drawer"
    :style="{ width: 'min(760px, 100vw)' }"
    :pt="{
      mask: {
        class: 'cooperative-member-role-drawer-mask',
      },
    }"
    @update:visible="handleVisibilityChange"
  >
    <template #header>
      <div class="flex w-full items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold tracking-[-0.02em] text-heading">
            {{ drawerTitle }}
          </h2>

          <p class="mt-1 text-sm leading-6 text-secondary-text">
            Step {{ currentStep + 1 }} of {{ steps.length }}:
            <span class="font-semibold text-heading">{{ currentStepLabel }}</span>
          </p>
        </div>

        <Button
          type="button"
          severity="secondary"
          text
          rounded
          aria-label="Close drawer"
          class="drawer-icon-button shrink-0"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          <X class="h-5 w-5" :stroke-width="2" />
        </Button>
      </div>
    </template>

    <div class="mb-5 grid gap-2 sm:grid-cols-3">
      <button
        v-for="(step, index) in steps"
        :key="step.label"
        type="button"
        class="step-button"
        :class="{
          'step-button-active': currentStep === index,
          'step-button-error': hasStepErrors(index),
        }"
        @click="goToStep(index)"
      >
        <span class="step-number">
          {{ index + 1 }}
        </span>

        <span class="min-w-0">
          <span class="block truncate text-xs font-bold">
            {{ step.label }}
          </span>

          <span class="mt-0.5 block truncate text-[11px] font-medium opacity-80">
            {{ step.description }}
          </span>
        </span>
      </button>
    </div>

    <div
      v-if="generalError || getFieldError('general')"
      class="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm font-semibold text-error"
    >
      {{ generalError || getFieldError('general') }}
    </div>

    <form id="cooperative-member-role-drawer-form" class="space-y-6" @submit.prevent="handleSubmit">
      <section v-if="currentStep === 0">
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
            <label for="drawer-role-name" class="form-label">
              Role Name
              <span class="text-error">*</span>
            </label>

            <InputText
              id="drawer-role-name"
              v-model="form.name"
              required
              placeholder="Example: Cooperative Admin"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('name') }"
            />

            <p v-if="hasFieldError('name')" class="form-error">
              {{ getFieldError('name') }}
            </p>
          </div>

          <div class="form-field">
            <label for="drawer-role-description" class="form-label">
              Description
              <span class="text-muted-text">(Optional)</span>
            </label>

            <Textarea
              id="drawer-role-description"
              v-model="form.description"
              rows="5"
              auto-resize
              placeholder="Briefly describe this role"
              class="form-input"
              :class="{ 'form-input-error': hasFieldError('description') }"
            />

            <p v-if="hasFieldError('description')" class="form-error">
              {{ getFieldError('description') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="currentStep === 1">
        <div class="mb-4 flex items-start gap-2">
          <KeyRound class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Role Permissions</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Select permissions by category. You can select a full category or individual
              permissions.
            </p>
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">
            Permissions
            <span class="text-muted-text">(Optional)</span>
          </label>

          <div
            class="permission-tree"
            :class="{ 'form-input-error': hasFieldError('permissionIds', 'permissions') }"
          >
            <div v-if="isLoadingPermissions" class="permission-loading">
              <LoaderCircle class="h-4 w-4 animate-spin" :stroke-width="2" />
              <span>Loading permissions...</span>
            </div>

            <template v-else>
              <div
                v-for="group in permissionGroups"
                :key="group.category"
                class="permission-category"
              >
                <div class="permission-category-header">
                  <button
                    type="button"
                    class="permission-category-toggle"
                    @click="toggleCategoryExpansion(group.category)"
                  >
                    <ChevronDown
                      v-if="isCategoryExpanded(group.category)"
                      class="h-4 w-4"
                      :stroke-width="2"
                    />

                    <ChevronRight v-else class="h-4 w-4" :stroke-width="2" />
                  </button>

                  <Checkbox
                    :input-id="`category-${group.category}`"
                    binary
                    :model-value="isCategoryFullySelected(group)"
                    :indeterminate="isCategoryPartiallySelected(group)"
                    :disabled="isSubmitting"
                    @update:model-value="
                      (checked) => toggleCategoryPermissions(group, Boolean(checked))
                    "
                  />

                  <label :for="`category-${group.category}`" class="permission-category-label">
                    {{ group.category }}
                  </label>

                  <span class="permission-category-count">
                    {{
                      group.options.filter((permission) => isPermissionSelected(permission.value))
                        .length
                    }}/{{ group.options.length }}
                  </span>
                </div>

                <div v-if="isCategoryExpanded(group.category)" class="permission-items">
                  <label
                    v-for="permission in group.options"
                    :key="permission.value"
                    class="permission-item"
                    :for="`permission-${permission.value}`"
                  >
                    <Checkbox
                      :input-id="`permission-${permission.value}`"
                      binary
                      :model-value="isPermissionSelected(permission.value)"
                      :disabled="isSubmitting"
                      @update:model-value="
                        (checked) => togglePermission(permission.value, Boolean(checked))
                      "
                    />

                    <span class="min-w-0">
                      <span class="permission-name">
                        {{ permission.label }}
                      </span>

                      <span v-if="permission.description" class="permission-description">
                        {{ permission.description }}
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div v-if="!permissionGroups.length" class="permission-empty">
                No permissions available.
              </div>
            </template>
          </div>

          <p class="text-xs leading-5 text-secondary-text">
            {{ selectedPermissionsCount }}
            {{ selectedPermissionsCount === 1 ? 'permission selected' : 'permissions selected' }}.
          </p>

          <p v-if="hasFieldError('permissionIds', 'permissions')" class="form-error">
            {{ getFieldError('permissionIds', 'permissions') }}
          </p>
        </div>
      </section>

      <section v-if="currentStep === 2">
        <div class="mb-4 flex items-start gap-2">
          <BadgeCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

          <div>
            <h3 class="text-sm font-bold text-heading">Review Role</h3>

            <p class="mt-1 text-xs leading-5 text-secondary-text">
              Confirm the role details before saving.
            </p>
          </div>
        </div>

        <div class="grid gap-3">
          <div class="review-card">
            <p class="review-label">Role Name</p>
            <p class="review-value">{{ form.name || 'Not provided' }}</p>
          </div>

          <div class="review-card">
            <p class="review-label">Description</p>
            <p class="review-value">
              {{ form.description || 'Not provided' }}
            </p>
          </div>

          <div class="review-card">
            <p class="review-label">Selected Permissions</p>
            <p class="review-value">
              {{ selectedPermissionsCount }}
              {{ selectedPermissionsCount === 1 ? 'permission' : 'permissions' }}
            </p>
          </div>

          <div class="review-card">
            <div class="flex items-start gap-2">
              <FileText class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="2" />

              <div class="min-w-0">
                <p class="review-label">Permission Summary</p>

                <div v-if="selectedPermissionGroups.length" class="mt-3 grid gap-3">
                  <div
                    v-for="group in selectedPermissionGroups"
                    :key="group.category"
                    class="selected-permission-group"
                  >
                    <p class="selected-permission-category">
                      {{ group.category }}
                    </p>

                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="permission in group.options"
                        :key="permission.value"
                        class="permission-chip"
                      >
                        {{ permission.label }}
                      </span>
                    </div>
                  </div>
                </div>

                <p v-else class="mt-2 text-sm font-semibold text-secondary-text">
                  No permissions selected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </form>

    <template #footer>
      <div
        class="flex w-full flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button
          type="button"
          severity="secondary"
          outlined
          class="drawer-secondary-button"
          :disabled="isSubmitting || isFirstStep"
          @click="goToPreviousStep"
        >
          Back
        </Button>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            severity="secondary"
            outlined
            class="drawer-secondary-button"
            :disabled="isSubmitting"
            @click="handleClose"
          >
            Cancel
          </Button>

          <Button
            v-if="!isLastStep"
            type="button"
            class="drawer-primary-button"
            :disabled="isSubmitting"
            @click="goToNextStep"
          >
            Next
          </Button>

          <Button
            v-else
            type="submit"
            form="cooperative-member-role-drawer-form"
            class="drawer-primary-button"
            :disabled="isSubmitting"
          >
            <LoaderCircle v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" :stroke-width="2" />

            <Save v-else class="mr-2 h-4 w-4" :stroke-width="2" />

            {{ isSubmitting ? 'Saving...' : submitLabel }}
          </Button>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
:global(.cooperative-member-role-drawer.p-drawer) {
  border-left: 1px solid var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-member-role-drawer .p-drawer-header),
:global(.cooperative-member-role-drawer .p-drawer-content),
:global(.cooperative-member-role-drawer .p-drawer-footer) {
  background-color: var(--color-card) !important;
  color: var(--color-heading) !important;
}

:global(.cooperative-member-role-drawer .p-drawer-header) {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid var(--color-border) !important;
}

:global(.cooperative-member-role-drawer .p-drawer-content) {
  padding: 1.5rem !important;
}

:global(.cooperative-member-role-drawer .p-drawer-footer) {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-border) !important;
}

:global(.cooperative-member-role-drawer-mask) {
  background-color: rgb(0 0 0 / 45%) !important;
  backdrop-filter: blur(2px);
}

.step-button {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-card) 92%, var(--color-surface));
  padding: 0.75rem;
  color: var(--color-secondary-text);
  text-align: left;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

.step-button:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-card));
  color: var(--color-heading);
}

.step-button-active {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-card));
  color: var(--color-heading);
}

.step-button-error {
  border-color: var(--color-error);
}

.step-number {
  display: flex;
  height: 1.65rem;
  width: 1.65rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  font-size: 0.75rem;
  font-weight: 800;
}

.step-button-error .step-number {
  background-color: var(--color-error);
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

.form-input-error {
  border-color: var(--color-error) !important;
}

.form-input-error:enabled:focus {
  border-color: var(--color-error) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 18%, transparent) !important;
}

.form-error {
  color: var(--color-error);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}

.review-card {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: color-mix(in srgb, var(--color-surface) 35%, var(--color-card));
  padding: 0.85rem 1rem;
}

.review-label {
  color: var(--color-muted-text);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.review-value {
  margin-top: 0.35rem;
  color: var(--color-heading);
  font-size: 0.9rem;
  font-weight: 700;
}

.permission-tree {
  max-height: 420px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-card);
  padding: 0.75rem;
}

.permission-loading,
.permission-empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-secondary-text);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 1rem;
}

.permission-category {
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 65%, transparent);
  padding: 0.45rem 0;
}

.permission-category:last-child {
  border-bottom: none;
}

.permission-category-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2rem;
}

.permission-category-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary-text);
  transition: color 160ms ease;
}

.permission-category-toggle:hover {
  color: var(--color-primary);
}

.permission-category-label {
  color: var(--color-heading);
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
}

.permission-category-count {
  margin-left: auto;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-card));
  color: var(--color-primary);
  padding: 0.2rem 0.5rem;
  font-size: 0.68rem;
  font-weight: 800;
}

.permission-items {
  display: grid;
  gap: 0.35rem;
  padding: 0.4rem 0 0.55rem 2.25rem;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-height: 1.75rem;
  cursor: pointer;
}

.permission-name {
  display: block;
  color: var(--color-heading);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.25rem;
}

.permission-description {
  display: block;
  margin-top: 0.1rem;
  color: var(--color-secondary-text);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.15rem;
}

.selected-permission-group {
  border-radius: 0.65rem;
  background-color: color-mix(in srgb, var(--color-surface) 35%, var(--color-card));
  padding: 0.75rem;
}

.selected-permission-category {
  color: var(--color-heading);
  font-size: 0.78rem;
  font-weight: 800;
}

.permission-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--color-primary) 12%, var(--color-card));
  color: var(--color-primary);
  padding: 0.35rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 800;
}

:global(.cooperative-member-role-drawer .p-inputtext),
:global(.cooperative-member-role-drawer .p-textarea) {
  padding: 0.7rem 0.8rem !important;
}

:global(.cooperative-member-role-drawer .p-checkbox-box) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  box-shadow: none !important;
}

:global(.cooperative-member-role-drawer .p-checkbox-checked .p-checkbox-box) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
}

:global(
  .cooperative-member-role-drawer
    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover)
    .p-checkbox-box
) {
  border-color: var(--color-primary) !important;
}

:global(.cooperative-member-role-drawer .drawer-icon-button.p-button) {
  color: var(--color-secondary-text) !important;
}

:global(.cooperative-member-role-drawer .drawer-icon-button.p-button:hover) {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-member-role-drawer .drawer-secondary-button.p-button) {
  border-color: var(--color-border) !important;
  background-color: var(--color-card) !important;
  color: var(--color-secondary-text) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-member-role-drawer .drawer-secondary-button.p-button:hover) {
  border-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-card)) !important;
  color: var(--color-primary) !important;
}

:global(.cooperative-member-role-drawer .drawer-primary-button.p-button) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}

:global(.cooperative-member-role-drawer .drawer-primary-button.p-button:hover) {
  border-color: var(--color-primary-hover) !important;
  background-color: var(--color-primary-hover) !important;
}
</style>
