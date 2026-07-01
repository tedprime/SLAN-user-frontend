import { apiRequest } from "./api";
import { mockAssessments } from "./mockAssessments";
import type { Assessment, AssessmentResult } from "./types/assessment.types";

type ApiResponseEnvelope<T> = { success: boolean; data: T };

/**
 * Pulls a numeric unit id out of a slug like "leadership-basics-unit-4".
 * Only used as a key into mockAssessments when the real backend endpoint
 * isn't available yet — remove once GET /units/{slug}/assessment ships.
 */
function unitIdFromSlug(slug: string): number {
  const match = slug.match(/(\d+)(?!.*\d)/); // last run of digits in the slug
  return match ? parseInt(match[1], 10) : 0;
}

export const assessmentService = {
  /**
   * GET /units/{slug}/assessment
   * Fetch the assessment for a specific unit, if one exists.
   * Falls back to local mock data if the endpoint 404s or isn't
   * implemented yet, so the UI can be built/tested independently
   * of the backend.
   */
  getUnitAssessment: async (unitSlug: string): Promise<Assessment | null> => {
    try {
      const res = await apiRequest<
        Assessment | ApiResponseEnvelope<Assessment>
      >(`/units/${unitSlug}/assessment`);
      const assessment = "data" in res && res.data ? res.data : (res as Assessment);
      return assessment ?? null;
    } catch {
      return mockAssessments[unitIdFromSlug(unitSlug)] ?? null;
    }
  },

  /**
   * POST /progress/assessments/{assessmentId}/submit
   * Submit assessment answers and get the scored result back.
   */
  submitAssessment: async (
    assessmentId: string,
    answers: Record<string, number>,
  ): Promise<AssessmentResult> => {
    const res = await apiRequest<ApiResponseEnvelope<AssessmentResult>>(
      `/progress/assessments/${assessmentId}/submit`,
      {
        method: "POST",
        body: { answers },
      },
    );
    return res.data;
  },

  /**
   * GET /progress/assessments/{assessmentId}
   * Previous result for this assessment, if the learner has attempted it
   * before. Used so a unit the learner already passed doesn't force them
   * through the assessment again when they revisit it.
   */
  getAssessmentResult: async (
    assessmentId: string,
  ): Promise<AssessmentResult | null> => {
    try {
      const res = await apiRequest<ApiResponseEnvelope<AssessmentResult>>(
        `/progress/assessments/${assessmentId}`,
      );
      return res.data ?? null;
    } catch {
      return null;
    }
  },
};