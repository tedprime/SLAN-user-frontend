import { apiRequest } from "./api";

export interface Enrollment {
  id: number;
  trackId: number;
  [key: string]: unknown;
}

interface EnrollResponse {
  requiresPayment?: boolean;
}

interface ApiError {
  status?: number;
  message?: string;
}

export const enrollmentService = {
  /**
   * Returns the user's enrollment for this track, or null if they
   * aren't enrolled (the API returns 404 in that case — that's a
   * normal "not enrolled yet" outcome, not an error).
   */
  getEnrollment: async (trackId: number): Promise<Enrollment | null> => {
    try {
      return await apiRequest<Enrollment>(`/enrollments/${trackId}`);
    } catch (err) {
      if ((err as ApiError).status === 404) return null;
      throw err;
    }
  },

  getMyEnrollments: () => apiRequest<Enrollment[]>("/enrollments"),

  /**
   * Enrolls the user in a track. All tracks are treated as free for now —
   * a `requiresPayment: true` response is not yet handled by callers.
   */
  enroll: (trackId: number) =>
    apiRequest<EnrollResponse>("/enrollments", {
      method: "POST",
      body: { trackId },
    }),
};