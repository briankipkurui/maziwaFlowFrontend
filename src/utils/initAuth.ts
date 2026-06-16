import { authService } from '@/features/auth/services/auth.service';
import { useAuthFeatureStore } from '@/features/auth/stores/authStore';

let refreshPromise: Promise<boolean> | null = null;

export const initializeAuth = async (): Promise<boolean> => {
  const authStore = useAuthFeatureStore();

  if (authStore.accessToken) {
    return true;
  }

  if (!refreshPromise) {
    refreshPromise = authService
      .refresh()
      .then((data) => {
        authStore.setAuth(data);
        return true;
      })
      .catch(() => {
        authStore.clearAuth();
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};