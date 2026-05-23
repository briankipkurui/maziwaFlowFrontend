import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';
import { useAuthStore } from '@/stores/auth';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Public instance - no auth interceptors (for login, forgot-password, etc.)
export const httpPublic = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Authenticated instance - with auth interceptors
const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - adds auth token from store
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handles token refresh and errors
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const authStore = useAuthStore();

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = authStore.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await httpPublic.post('/auth/refresh-token', { refreshToken });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Update store with new tokens
          authStore.setAccessToken(accessToken);
          authStore.setRefreshToken(newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return http(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth and redirect to login
          authStore.clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - clear and redirect
        authStore.clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default http;
