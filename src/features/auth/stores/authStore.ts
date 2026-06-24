import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import type { Coopera, LoginResponse, User } from '../types/auth';

const LOGOUT_IN_PROGRESS_KEY = 'logoutInProgress';

export const useAuthFeatureStore = defineStore('authFeature', () => {
  const user = ref<User | null>(null);
  const cooperatives = ref<Coopera[]>([]);

  const selectedCooperativeId = ref<string | null>(null);

  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const message = ref<string | null>(null);

  const isLoggingOut = ref(sessionStorage.getItem(LOGOUT_IN_PROGRESS_KEY) === 'true');

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value));

  const activeCooperativeId = computed<string | null>(() => {
    return selectedCooperativeId.value ?? cooperatives.value[0]?.cooperativeId ?? null;
  });

  const activeCooperative = computed<Coopera | null>(() => {
    if (!activeCooperativeId.value) {
      return null;
    }

    return (
      cooperatives.value.find(
        (cooperative) => cooperative.cooperativeId === activeCooperativeId.value,
      ) ?? null
    );
  });

  const permissionNames = computed<string[]>(() => {
    const names = new Set<string>();

    /**
     * System/user role permissions.
     */
    for (const permission of user.value?.role?.permissions ?? []) {
      if (permission.name) {
        names.add(permission.name);
      }
    }

    /**
     * Active cooperative direct permissions.
     */
    for (const permission of activeCooperative.value?.permissions ?? []) {
      if (permission.name) {
        names.add(permission.name);
      }
    }

    /**
     * Active cooperative role permissions.
     */
    for (const role of activeCooperative.value?.roles ?? []) {
      for (const permission of role.permissions ?? []) {
        if (permission.name) {
          names.add(permission.name);
        }
      }
    }

    return Array.from(names);
  });

  function hasPermission(permission: string): boolean {
    return permissionNames.value.includes(permission);
  }

  function hasAnyPermission(permissions: string[]): boolean {
    if (!permissions.length) {
      return true;
    }

    return permissions.some((permission) => hasPermission(permission));
  }

  function hasAllPermissions(permissions: string[]): boolean {
    if (!permissions.length) {
      return true;
    }

    return permissions.every((permission) => hasPermission(permission));
  }

  function setAuth(loginResponse: LoginResponse) {
    isLoggingOut.value = false;
    sessionStorage.removeItem(LOGOUT_IN_PROGRESS_KEY);

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
    if (isLoggingOut.value) {
      return null;
    }

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

  function logout() {
    isLoggingOut.value = true;
    sessionStorage.setItem(LOGOUT_IN_PROGRESS_KEY, 'true');

    clearAuth();

    /**
     * Clear possible persisted Pinia/auth keys.
     */
    localStorage.removeItem('authFeature');
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    sessionStorage.removeItem('authFeature');
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('lastAuthenticatedRoute');

    /**
     * Clear non-httpOnly cookies if any were created from frontend.
     * If refreshToken is httpOnly, this part will not clear it;
     * your backend logout endpoint must clear it.
     */
    document.cookie = 'accessToken=; Max-Age=0; path=/';
    document.cookie = 'refreshToken=; Max-Age=0; path=/';
  }

  function finishLogout() {
    isLoggingOut.value = false;
    sessionStorage.removeItem(LOGOUT_IN_PROGRESS_KEY);
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
    isLoggingOut,

    permissionNames,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    setAuth,
    setActiveCooperativeId,
    setUser,
    setAccessToken,
    setRefreshToken,
    setMessage,
    getRefreshToken,
    clearAuth,
    logout,
    finishLogout,
  };
});