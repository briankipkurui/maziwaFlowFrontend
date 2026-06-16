import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import type { Coopera, LoginResponse, User } from '../types/auth';

export const useAuthFeatureStore = defineStore('authFeature', () => {
  const user = ref<User | null>(null);
  const cooperatives = ref<Coopera[]>([]);

  const selectedCooperativeId = ref<string | null>(null);

  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const message = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value));

  /**
   * Defaults to the first cooperative returned after login.
   * You can later change it through setActiveCooperativeId()
   * when implementing cooperative switching.
   */
  const activeCooperativeId = computed<string | null>(() => {
    return selectedCooperativeId.value ?? cooperatives.value[0]?.cooperativeId ?? null;
  });

  const activeCooperative = computed<Coopera | null>(() => {
    if (!activeCooperativeId.value) return null;

    return (
      cooperatives.value.find(
        (cooperative) => cooperative.cooperativeId === activeCooperativeId.value,
      ) ?? null
    );
  });

  function setAuth(loginResponse: LoginResponse) {
    user.value = loginResponse.data.user;
    cooperatives.value = loginResponse.data.cooperatives;

    accessToken.value = loginResponse.accessToken;
    refreshToken.value = loginResponse.refreshToken;
    message.value = loginResponse.message;

    selectedCooperativeId.value = loginResponse.data.cooperatives[0]?.cooperativeId ?? null;
  }

  function setActiveCooperativeId(cooperativeId: string) {
    const cooperativeExists = cooperatives.value.some(
      (cooperative) => cooperative.cooperativeId === cooperativeId,
    );

    if (!cooperativeExists) {
      throw new Error('The selected cooperative is not linked to the logged-in user.');
    }

    selectedCooperativeId.value = cooperativeId;
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
    selectedCooperativeId.value = null;

    accessToken.value = null;
    refreshToken.value = null;
    message.value = null;
  }

  return {
    user,
    cooperatives,
    selectedCooperativeId,
    activeCooperativeId,
    activeCooperative,
    accessToken,
    refreshToken,
    message,
    isAuthenticated,
    setAuth,
    setActiveCooperativeId,
    setUser,
    setAccessToken,
    setRefreshToken,
    setMessage,
    getRefreshToken,
    clearAuth,
  };
});
