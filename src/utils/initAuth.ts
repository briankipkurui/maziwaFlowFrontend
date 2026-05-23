import { useAuthStore } from '@/stores/auth';

/**
 * Initialize auth state from sessionStorage.
 * The store auto-hydrates on creation, so we just verify the state is valid.
 */
export function initializeAuth(): void {
  const authStore = useAuthStore();

  // If we have user but no tokens, clear the invalid state
  if (authStore.user && !authStore.accessToken) {
    authStore.clearAuth();
  }
}
