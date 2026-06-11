// ── Signup ──────────────────────────────────────────────
export interface CheckEmailPayload {
  email: string;
}

export interface RegisterPayload {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  state: string;
  schoolName: string;
}

export interface VerifySignupOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

// ── Login ────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyLoginOtpPayload {
  email: string;
  otp: string;
}

// ── Google ───────────────────────────────────────────────
export interface CompleteGoogleSignupPayload {
  tempToken: string;
  fullName: string;
  phone: string;
  role: string;
  state: string;
  schoolName: string;
}

// ── Password ─────────────────────────────────────────────
export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Session ──────────────────────────────────────────────
export interface RefreshTokenPayload {
  refreshToken: string;
}

// ── Shared Response ──────────────────────────────────────
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}