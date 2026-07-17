import { apiRequest } from "./api";

// NOTE: exact field names for the prompt (`description`, `criteria`) are
// inferred from the Swagger summary ("Array of reflection prompts with
// description and criteria") — the docs don't show a full example body.
// If the real response uses different keys, this is the only place to fix.
export interface ReflectionPrompt {
  id: number;
  moduleId: number;
  description: string;
  criteria: string[];
}

export interface ReflectionResponse {
  reflectionId: number;
  response: string;
  updatedAt?: string;
}

export const reflectionService = {
  /**
   * GET /modules/{moduleId}/reflection
   * A module without a configured reflection 404s — we treat that as
   * "nothing to show" rather than a failure, so callers get `null` instead
   * of having to catch an error for a perfectly normal case.
   */
  getModuleReflection: async (moduleId: number): Promise<ReflectionPrompt[] | null> => {
    try {
      return await apiRequest<ReflectionPrompt[]>(`/modules/${moduleId}/reflection`);
    } catch (err) {
      if ((err as { status?: number })?.status === 404) return null;
      throw err;
    }
  },

  /**
   * GET /modules/{moduleId}/reflection/my-response
   * Returns whatever the learner has already submitted so the form can be
   * pre-filled, or null if they haven't answered yet.
   */
  getMyReflectionResponse: (moduleId: number) =>
    apiRequest<ReflectionResponse[] | ReflectionResponse | null>(
      `/modules/${moduleId}/reflection/my-response`
    ),

  /**
   * POST /modules/{moduleId}/reflection/response
   * Upserts — submitting again for the same reflectionId overwrites the
   * previous answer, so this doubles as both "submit" and "edit".
   */
  submitReflectionResponse: (moduleId: number, reflectionId: number, response: string) =>
    apiRequest<{ message?: string }>(`/modules/${moduleId}/reflection/response`, {
      method: "POST",
      body: { reflectionId, response },
    }),
};
