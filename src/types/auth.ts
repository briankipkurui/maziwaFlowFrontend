// Request types
export interface LoginRequest {
  login: string;
  password: string;
}

export interface VerifyTokenRequest {
  email: string;
  otpCode: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface SendLogoutOtpRequest {
  email: string;
}

export interface LogoutOtherSessionsRequest {
  otpCode: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  otpRequired: boolean;
  email: string;
}

export interface TwoFAResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface VerifyTokenResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
