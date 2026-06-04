import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LoginResponse, User, Coopera } from '../types/cooperative';

export const useAuthFeatureStore = defineStore('authFeature', () => {
  const user = ref<User | null>(null);
  const cooperatives = ref<Coopera[]>([]);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const message = ref<string | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  function setAuth(loginResponse: LoginResponse) {
    user.value = loginResponse.data.user;
    cooperatives.value = loginResponse.data.cooperatives;
    accessToken.value = loginResponse.accessToken;
    refreshToken.value = loginResponse.refreshToken;
    message.value = loginResponse.message;
  }

  function setUser(userData: User) {
    user.value = userData;
  }

  function setAccessToken(token: string) {
    accessToken.value = token;
  }

  function setRefreshToken(token: string) {
    refreshToken.value = token;
  }

  function setMessage(text: string) {
    message.value = text;
  }

  function getRefreshToken(): string | null {
    return refreshToken.value;
  }

  function clearAuth() {
    user.value = null;
    cooperatives.value = [];
    accessToken.value = null;
    refreshToken.value = null;
    message.value = null;
  }

  return {
    user,
    cooperatives,
    accessToken,
    refreshToken,
    message,
    isAuthenticated,
    setAuth,
    setUser,
    setAccessToken,
    setRefreshToken,
    setMessage,
    getRefreshToken,
    clearAuth,
  };
});
