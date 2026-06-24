import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';
import { useAuthFeatureStore } from '../features/auth/stores/authStore';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const redirectToLogin = () => {
  const currentUrl = new URL(window.location.href);
  const tenant = currentUrl.searchParams.get('tenant');

  window.location.href = tenant ? `/login?tenant=${encodeURIComponent(tenant)}` : '/login';
};

export const httpPublic = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthFeatureStore();
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
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const authStore = useAuthFeatureStore();

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        /**
         * Refresh token is stored in an httpOnly cookie.
         * Do NOT read it from Pinia/localStorage.
         * Do NOT send it in the request body.
         * Browser will send the cookie automatically because withCredentials is true.
         */
        const response = await httpPublic.post('/auth/refresh-token');

        const { accessToken } = response.data;

        authStore.setAccessToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return http(originalRequest);
      } catch (refreshError) {
        authStore.clearAuth();
        redirectToLogin();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default http;
