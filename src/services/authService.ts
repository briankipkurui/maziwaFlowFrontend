import http, { httpPublic } from './axios';
import { AUTH_ENDPOINTS } from './endpoints/auth';
import type {
  BaseResponse,
  LoginRequest,
  LoginResponse,
  TwoFAResponse,
  VerifyTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SendLogoutOtpRequest,
  LogoutOtherSessionsRequest,
} from '@/types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpPublic.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  }

  async verifyToken(data: VerifyTokenRequest): Promise<TwoFAResponse> {
    const response = await httpPublic.post<TwoFAResponse>(AUTH_ENDPOINTS.TWO_FA_VERIFY, data);
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<BaseResponse> {
    const response = await httpPublic.post<BaseResponse>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<BaseResponse> {
    const response = await httpPublic.post<BaseResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
    return response.data;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await httpPublic.post<RefreshTokenResponse>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      data,
    );
    return response.data;
  }

  async logout(): Promise<BaseResponse> {
    const response = await http.post<BaseResponse>(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  }

  async sendLogoutOtp(data: SendLogoutOtpRequest): Promise<BaseResponse> {
    const response = await httpPublic.post<BaseResponse>(AUTH_ENDPOINTS.SEND_LOGOUT_OTP, data);
    return response.data;
  }

  async logoutOtherSessions(data: LogoutOtherSessionsRequest): Promise<TwoFAResponse> {
    const response = await httpPublic.post<TwoFAResponse>(
      AUTH_ENDPOINTS.LOGOUT_OTHER_SESSIONS,
      data,
    );
    return response.data;
  }
}

export default new AuthService();
