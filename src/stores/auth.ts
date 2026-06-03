import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const useAuthStore = defineStore('auth', () => {
  // Hydrate from localStorage
  const storedUser = localStorage.getItem(USER_KEY);
  const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  // State
  const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null);
  const accessToken = ref<string | null>(storedAccessToken);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  // Actions
  function setAuth(userData: User, token: string) {
    user.value = userData;
    accessToken.value = token;
    // Persist to localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  function setAccessToken(token: string) {
    accessToken.value = token;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  function setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
