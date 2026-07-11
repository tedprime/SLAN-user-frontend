// Target path in your project: src/services/assessmentService.ts
import { apiRequest } from "./api";
import type {
  ModuleAssessment,
  ModuleAssessmentResponse,
  AssessmentSubmitPayload,
  AssessmentResult,
  AssessmentResultResponse,
} from "./types/assessment.types";

export const assessmentService = {
  /**
   * GET /modules/{moduleId}/assessment
   * Student-facing: questions + config, no correct answers.
   * Handles both unwrapped and wrapped { data } envelopes defensively,
   * same pattern as courseService.
   */
  getModuleAssessment: async (moduleId: number): Promise<ModuleAssessment> => {
    const res = await apiRequest<ModuleAssessmentResponse | ModuleAssessment>(
      `/modules/${moduleId}/assessment`
    );
    return "data" in res && res.data ? res.data : (res as ModuleAssessment);
  },

  /**
   * POST /modules/{moduleId}/assessment/submit
   * Returns the graded result + per-question review.
   */
  submitAssessment: async (
    moduleId: number,
    payload: AssessmentSubmitPayload
  ): Promise<AssessmentResult> => {
    const res = await apiRequest<AssessmentResultResponse | AssessmentResult>(
      `/modules/${moduleId}/assessment/submit`,
      { method: "POST", body: payload }
    );
    return "data" in res && res.data ? res.data : (res as AssessmentResult);
  },
};