// ── GET /me ────────────────────────────────────────────────
export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  state: string;
  schoolName: string;
  schoolLocation: string;
  schoolType: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
}

// ── PATCH /me ──────────────────────────────────────────────
// All fields optional — the API rejects the call with 400 if none are sent.
export interface UpdateProfilePayload {
  fullName?: string;
  state?: string;
  schoolName?: string;
  schoolLocation?: string;
  schoolType?: string;
}

// ── PATCH /me/password ────────────────────────────────────
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
