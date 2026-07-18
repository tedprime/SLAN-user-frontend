// Target path in your project: src/services/assessmentService.ts
import { apiRequest } from "./api";
import type {
  AssessmentConfig,
  AssessmentConfigResponse,
  AssessmentType,
  AttemptListResponse,
  AttemptSummary,
  StartAttemptPayload,
  AttemptStart,
  AttemptStartResponse,
  SaveAttemptPayload,
  SaveAttemptResult,
  SubmitAttemptPayload,
  SubmitAttemptResult,
  AttemptResult,
  AttemptResultResponse,
} from "./types/assessment.types";

interface ApiError {
  status?: number;
  message?: string;
}

export const assessmentService = {
  /**
   * GET /modules/{moduleId}/assessment
   * Config only — title, description, pass mark, attempts, time limit.
   * Returns null (not throws) on 404, since "no assessment configured
   * for this module" is a normal state, not an error.
   */
  getModuleAssessmentConfig: async (moduleId: number): Promise<AssessmentConfig | null> => {
    try {
      const res = await apiRequest<AssessmentConfigResponse | AssessmentConfig>(
        `/modules/${moduleId}/assessment`
      );
      return "data" in res && res.data ? res.data : (res as AssessmentConfig);
    } catch (err) {
      if ((err as ApiError).status === 404) return null;
      throw err;
    }
  },

  /**
   * GET /tracks/{trackId}/assessment
   * Same shape as the module config, but for the track-level assessment
   * unlocked once every module in the track is completed. Returns null
   * (not throws) on 404, since "no assessment configured for this track"
   * is a normal state, not an error.
   */
  getTrackAssessmentConfig: async (trackId: number): Promise<AssessmentConfig | null> => {
    try {
      const res = await apiRequest<AssessmentConfigResponse | AssessmentConfig>(
        `/tracks/${trackId}/assessment`
      );
      return "data" in res && res.data ? res.data : (res as AssessmentConfig);
    } catch (err) {
      if ((err as ApiError).status === 404) return null;
      throw err;
    }
  },

  /**
   * GET /attempts?assessmentType=&assessmentId=
   * Past attempts for this assessment, most recent first.
   */
  listAttempts: async (
    assessmentType: AssessmentType,
    assessmentId: number
  ): Promise<AttemptSummary[]> => {
    const res = await apiRequest<AttemptListResponse | AttemptSummary[]>(
      `/attempts?assessmentType=${assessmentType}&assessmentId=${assessmentId}`
    );
    return "data" in res && res.data ? res.data : (res as AttemptSummary[]);
  },

  /**
   * POST /attempts/start
   * assessmentId here is the assessment's own id (config.id), not the
   * moduleId. Server enforces maxAttempts / isActive — may reject.
   */
  startAttempt: async (payload: StartAttemptPayload): Promise<AttemptStart> => {
    const res = await apiRequest<AttemptStartResponse | AttemptStart>("/attempts/start", {
      method: "POST",
      body: payload,
    });
    return "data" in res && res.data ? res.data : (res as AttemptStart);
  },

  /**
   * PATCH /attempts/{attemptId}/save
   * Best-effort autosave — callers should swallow errors from this,
   * it's not critical if an individual save fails.
   */
  saveAttempt: (attemptId: number, payload: SaveAttemptPayload) =>
    apiRequest<SaveAttemptResult>(`/attempts/${attemptId}/save`, {
      method: "PATCH",
      body: payload,
    }),

  /**
   * POST /attempts/{attemptId}/submit
   * Returns the score only — no per-question breakdown.
   */
  submitAttempt: async (
    attemptId: number,
    payload: SubmitAttemptPayload
  ): Promise<SubmitAttemptResult> => {
    const res = await apiRequest<
      { success: boolean; data: SubmitAttemptResult } | SubmitAttemptResult
    >(`/attempts/${attemptId}/submit`, { method: "POST", body: payload });
    return "data" in res && res.data ? res.data : (res as SubmitAttemptResult);
  },

  /**
   * GET /attempts/{attemptId}/result
   * Full per-question breakdown with correctAnswerText revealed.
   * Only available after submission.
   */
  getAttemptResult: async (attemptId: number): Promise<AttemptResult> => {
    const res = await apiRequest<AttemptResultResponse | AttemptResult>(
      `/attempts/${attemptId}/result`
    );
    return "data" in res && res.data ? res.data : (res as AttemptResult);
  },
};
