import { apiRequest } from "./api";
import type {
  CheckEmailPayload,
  RegisterPayload,
  VerifySignupOtpPayload,
  ResendOtpPayload,
  LoginPayload,
  VerifyLoginOtpPayload,
  CompleteGoogleSignupPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  AuthTokenResponse,
} from "./types/auth.types";

export const authService = {
  // ── Signup ──────────────────────────────────────────────
  checkEmail: (payload: CheckEmailPayload) =>
    apiRequest<{ message: string }>("/auth/signup/email", {
      method: "POST",
      body: payload,
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<{ message: string }>("/auth/signup/register", {
      method: "POST",
      body: payload,
    }),

  verifySignupOtp: (payload: VerifySignupOtpPayload) =>
    apiRequest<AuthTokenResponse>("/auth/signup/verify-otp", {
      method: "POST",
      body: payload,
    }),

  resendSignupOtp: (payload: ResendOtpPayload) =>
    apiRequest<{ message: string }>("/auth/signup/resend-otp", {
      method: "POST",
      body: payload,
    }),

  // ── Login ────────────────────────────────────────────────
  login: (payload: LoginPayload) =>
    apiRequest<{ message: string }>("/auth/login", {
      method: "POST",
      body: payload,
    }),

  verifyLoginOtp: (payload: VerifyLoginOtpPayload) =>
    apiRequest<AuthTokenResponse>("/auth/login/verify-otp", {
      method: "POST",
      body: payload,
    }),

  resendLoginOtp: (payload: ResendOtpPayload) =>
    apiRequest<{ message: string }>("/auth/login/resend-otp", {
      method: "POST",
      body: payload,
    }),

  // ── Google ───────────────────────────────────────────────
  getGoogleSignupUrl: () =>
    apiRequest<{ url: string }>("/auth/google/signup"),

  getGoogleLoginUrl: () =>
    apiRequest<{ url: string }>("/auth/google/login"),

  completeGoogleSignup: (payload: CompleteGoogleSignupPayload) =>
    apiRequest<AuthTokenResponse>("/auth/signup/google/complete", {
      method: "POST",
      body: payload,
    }),

  // ── Password ─────────────────────────────────────────────
  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: payload,
    }),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: payload,
    }),

  // ── Session ──────────────────────────────────────────────
  refreshToken: (payload: RefreshTokenPayload) =>
    apiRequest<{ accessToken: string }>("/auth/token/refresh", {
      method: "POST",
      body: payload,
    }),

  logout: (payload: RefreshTokenPayload) =>
    apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
      body: payload,
    }),
};