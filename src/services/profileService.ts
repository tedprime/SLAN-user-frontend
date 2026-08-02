import { apiRequest } from "./api";
import { setUser } from "./tokenService";
import type {
  ProfileResponse,
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "./types/profile.types";

export const profileService = {
  /**
   * GET /me
   * Authenticated user's full profile (no passwordHash).
   */
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiRequest<ProfileResponse>("/me");
    return res.data;
  },

  /**
   * PATCH /me
   * Updates the profile fields provided, ignores the rest. Also refreshes
   * the cached `user` cookie (used by the header/sidebar for the name +
   * initials) so name changes show up immediately without a reload.
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const res = await apiRequest<ProfileResponse>("/me", {
      method: "PATCH",
      body: payload,
    });
    const profile = res.data;
    setUser({
      id: String(profile.id),
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
    });
    return profile;
  },

  /**
   * PATCH /me/password
   * 400s if currentPassword is wrong, or if the account has no password
   * set (social login).
   */
  changePassword: (payload: ChangePasswordPayload) =>
    apiRequest<{ message: string }>("/me/password", {
      method: "PATCH",
      body: payload,
    }),
};
