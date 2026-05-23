import type { QueryClient } from '@tanstack/vue-query';
import type { Router } from 'vue-router';
import { toast } from 'vue-sonner';
import authService from '@/services/authService';
import { authKeys } from '../queryKeys';
import { useAuthStore } from '@/stores/auth';
import type {
  BaseResponse,
  LoginRequest,
  TwoFAResponse,
  VerifyTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SendLogoutOtpRequest,
  LogoutOtherSessionsRequest,
  ApiError,
} from '@/types';
import type { AxiosError } from 'axios';

interface MutationDeps {
  router: Router;
  queryClient: QueryClient;
  authStore: ReturnType<typeof useAuthStore>;
}

export const createLoginMutation = () => ({
  mutationFn: async (credentials: LoginRequest): Promise<void> => {
    await authService.login(credentials);
  },

  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Login failed. Please try again.';

    if (error.response?.data?.hasActiveSession) {
      return;
    }

    toast.error(message);
  },
});

export const createVerifyTokenMutation = ({ queryClient, authStore }: MutationDeps) => ({
  mutationFn: (data: VerifyTokenRequest): Promise<TwoFAResponse> => authService.verifyToken(data),

  onSuccess: (data: TwoFAResponse) => {
    authStore.setAuth(data.user, data.accessToken);
    authStore.setRefreshToken(data.refreshToken);
    queryClient.setQueryData(authKeys.user(), data.user);
    toast.success('Login successful!');
  },

  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Invalid code. Please try again.';
    toast.error(message);
  },
});

export const createForgotPasswordMutation = () => ({
  mutationFn: (data: ForgotPasswordRequest): Promise<BaseResponse> =>
    authService.forgotPassword(data),

  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || 'Password reset link sent to your email.');
  },

  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Failed to send reset link.';
    toast.error(message);
  },
});

export const createResetPasswordMutation = ({ router }: MutationDeps) => ({
  mutationFn: (data: ResetPasswordRequest): Promise<BaseResponse> =>
    authService.resetPassword(data),

  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || 'Password reset successful!');
    router.push('/');
  },

  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Failed to reset password.';
    toast.error(message);
  },
});

export const createLogoutMutation = ({ router, queryClient, authStore }: MutationDeps) => ({
  mutationFn: (): Promise<BaseResponse> => authService.logout(),

  onSuccess: () => {
    authStore.clearAuth();
    queryClient.clear();
    router.push('/');
  },

  onError: () => {
    toast.error('Failed to logout. Please try again.');
  },
});

export const createSendLogoutOtpMutation = () => ({
  mutationFn: (data: SendLogoutOtpRequest): Promise<BaseResponse> =>
    authService.sendLogoutOtp(data),

  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || 'Verification code sent to your email.');
  },

  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Failed to send verification code.';
    toast.error(message);
  },
});

export const createLogoutOtherSessionsMutation = ({ router, authStore }: MutationDeps) => ({
  mutationFn: (data: LogoutOtherSessionsRequest): Promise<TwoFAResponse> =>
    authService.logoutOtherSessions(data),

  onSuccess: (data: TwoFAResponse) => {
    authStore.setAuth(data.user, data.accessToken);
    authStore.setRefreshToken(data.refreshToken);
    toast.success('Other session logged out. You can now login.');
    router.push('/dashboard');
  },

  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Failed to logout other sessions.';
    toast.error(message);
  },
});
