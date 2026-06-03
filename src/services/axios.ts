import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';
import { useAuthStore } from '@/stores/auth';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const httpPublic = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const authStore = useAuthStore();

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = authStore.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await httpPublic.post('/auth/refresh-token', {
            refreshToken,
          });

          const {
            accessToken,
            refreshToken: newRefreshToken,
          } = response.data;

          authStore.setAccessToken(accessToken);
          authStore.setRefreshToken(newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return http(originalRequest);
        } catch (refreshError) {
          authStore.clearAuth();

          const currentUrl = new URL(window.location.href);
          const tenant = currentUrl.searchParams.get('tenant');

          window.location.href = tenant
            ? `/login?tenant=${encodeURIComponent(tenant)}`
            : '/login';

          return Promise.reject(refreshError);
        }
      }

      authStore.clearAuth();

      const currentUrl = new URL(window.location.href);
      const tenant = currentUrl.searchParams.get('tenant');

      window.location.href = tenant
        ? `/login?tenant=${encodeURIComponent(tenant)}`
        : '/login';
    }

    return Promise.reject(error);
  },
);

export default http;