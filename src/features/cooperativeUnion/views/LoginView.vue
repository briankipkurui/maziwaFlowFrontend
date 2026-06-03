<script setup lang="ts">
import BackLayout from '@/layouts/BackLayout.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLoginMutation } from '../composables/mutations/authMutations';

const route = useRoute();
const router = useRouter();

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const cooperativeCode = computed(() => {
  const tenant = route.query.tenant;
  return Array.isArray(tenant) ? (tenant[0]?.toString() ?? '') : (tenant?.toString() ?? '');
});

const loginMutation = useLoginMutation();

const getErrorMessage = (error: unknown): string => {
  const err = error as {
    response?: {
      data?: {
        message?: string | string[];
        error?: string;
        statusCode?: number;
      };
    };
    message?: string;
  };

  const responseMessage = err.response?.data?.message;

  if (Array.isArray(responseMessage)) return responseMessage.join(', ');
  if (responseMessage) return responseMessage;
  if (err.response?.data?.error) return err.response.data.error;
  if (err.message) return err.message;

  return 'Login failed. Please try again.';
};

const preserveLoginQuery = async () => {
  await router.replace({
    path: '/login',
    query: {
      tenant: cooperativeCode.value,
    },
  });
};

const isAdminRole = (roleName?: string | null) => {
  const role = roleName?.trim().toLowerCase();

  return role === 'super admin' || role === 'super_admin' || role === 'default admin';
};

const handleLogin = async () => {
  errorMessage.value = '';

  if (!cooperativeCode.value) {
    errorMessage.value = 'Tenant is missing from the login URL.';
    return;
  }

  if (!username.value.trim()) {
    errorMessage.value = 'Please enter your username.';
    return;
  }

  if (!password.value.trim()) {
    errorMessage.value = 'Please enter your password.';
    return;
  }

  try {
    const response = await loginMutation.mutateAsync({
      cooperativeCode: cooperativeCode.value,
      identifier: username.value.trim(),
      password: password.value,
    });

    console.log('LOGIN RESPONSE:', response);

    const roleName = response.data.user.role?.name;

    console.log('ROLE NAME:', roleName);

    if (isAdminRole(roleName)) {
      await router.push({
        path: '/admin',
        query: {
          tenant: cooperativeCode.value,
        },
      });

      return;
    }

    await router.push({
      path: '/',
      query: {
        tenant: cooperativeCode.value,
      },
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    errorMessage.value = getErrorMessage(error);
    await preserveLoginQuery();
  }
};
</script>

<template>
  <BackLayout>
    <div class="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
      <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white"
          >
            MF
          </div>

          <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>

          <p class="mt-2 text-sm text-slate-500">Login to continue to MaziwaFlow</p>

          <p v-if="cooperativeCode" class="mt-2 text-xs font-medium text-emerald-600">
            Tenant: {{ cooperativeCode }}
          </p>

          <p v-else class="mt-2 text-xs font-medium text-red-600">Missing tenant code</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700"> Username </label>

            <input
              v-model="username"
              type="text"
              placeholder="Enter username"
              autocomplete="username"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700"> Password </label>

            <input
              v-model="password"
              type="password"
              placeholder="Enter password"
              autocomplete="current-password"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div
            v-if="errorMessage"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="loginMutation.isPending.value"
            class="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loginMutation.isPending.value ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </BackLayout>
</template>
