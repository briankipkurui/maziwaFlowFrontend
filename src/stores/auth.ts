import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const useAuthStore = defineStore('auth', () => {
  // Hydrate from sessionStorage
  const storedUser = sessionStorage.getItem(USER_KEY);
  const storedAccessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  // State
  const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null);
  const accessToken = ref<string | null>(storedAccessToken);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  // Actions
  function setAuth(userData: User, token: string) {
    user.value = userData;
    accessToken.value = token;
    // Persist to sessionStorage
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  function setAccessToken(token: string) {
    accessToken.value = token;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  function setRefreshToken(token: string) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  function getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  return {
    // State
    user,
    accessToken,
    // Getters
    isAuthenticated,
    // Actions
    setAuth,
    setAccessToken,
    setRefreshToken,
    getRefreshToken,
    clearAuth,
  };
});
