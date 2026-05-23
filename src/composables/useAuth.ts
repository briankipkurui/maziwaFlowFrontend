import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  createLoginMutation,
  createVerifyTokenMutation,
  createForgotPasswordMutation,
  createResetPasswordMutation,
  createLogoutMutation,
  createSendLogoutOtpMutation,
  createLogoutOtherSessionsMutation,
} from './api/mutations/auth';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const deps = { router, queryClient, authStore };

  const loginMutation = useMutation(createLoginMutation());
  const verifyTokenMutation = useMutation(createVerifyTokenMutation(deps));
  const forgotPasswordMutation = useMutation(createForgotPasswordMutation());
  const resetPasswordMutation = useMutation(createResetPasswordMutation(deps));
  const logoutMutation = useMutation(createLogoutMutation(deps));
  const sendLogoutOtpMutation = useMutation(createSendLogoutOtpMutation());
  const logoutOtherSessionsMutation = useMutation(createLogoutOtherSessionsMutation(deps));

  return {
    // Login
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    // Verify token
    verifyToken: verifyTokenMutation.mutate,
    verifyTokenAsync: verifyTokenMutation.mutateAsync,
    isVerifying: verifyTokenMutation.isPending,
    verifyError: verifyTokenMutation.error,

    // Forgot password
    forgotPassword: forgotPasswordMutation.mutate,
    forgotPasswordAsync: forgotPasswordMutation.mutateAsync,
    isSendingResetLink: forgotPasswordMutation.isPending,

    // Reset password
    resetPassword: resetPasswordMutation.mutate,
    resetPasswordAsync: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,

    // Logout
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    // Send logout OTP
    sendLogoutOtp: sendLogoutOtpMutation.mutate,
    sendLogoutOtpAsync: sendLogoutOtpMutation.mutateAsync,
    isSendingLogoutOtp: sendLogoutOtpMutation.isPending,

    // Logout other sessions
    logoutOtherSessions: logoutOtherSessionsMutation.mutate,
    logoutOtherSessionsAsync: logoutOtherSessionsMutation.mutateAsync,
    isLoggingOutOtherSessions: logoutOtherSessionsMutation.isPending,
  };
}
