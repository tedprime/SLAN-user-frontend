import { apiRequest } from "./api";

// Unwrap API envelope { success, data } — same pattern as progressService,
// since these endpoints wrap responses the same way.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && typeof res === "object" && "data" in res) return res.data as T;
  return res as T;
}

export interface ReflectionPrompt {
  id: number;
  moduleId: number;
  description: string;
  criteria: string;
  createdAt?: string;
  updatedAt?: string;
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
      const raw = await apiRequest<{ data: ReflectionPrompt[] } | ReflectionPrompt[]>(
        `/modules/${moduleId}/reflection`
      );
      return unwrap<ReflectionPrompt[]>(raw);
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
  getMyReflectionResponse: async (moduleId: number) => {
    const raw = await apiRequest<
      { data: ReflectionResponse[] | ReflectionResponse | null } | ReflectionResponse[] | ReflectionResponse | null
    >(`/modules/${moduleId}/reflection/my-response`);
    return unwrap<ReflectionResponse[] | ReflectionResponse | null>(raw);
  },

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
