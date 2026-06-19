import { apiRequest } from "./api";
import type {
  Course,
  CoursesResponse,
  TrackModulesResponse,
  ModuleUnitsResponse,
  UnitContent,
  UnitContentResponse,
} from "./types/course.types";

// Helper type to handle the standard API envelope structure
type ApiResponseEnvelope<T> = { success: boolean; data: T };

export const courseService = {
  /**
   * GET /courses
   * Published courses, each with track summaries.
   */
  getCourses: async (): Promise<Course[]> => {
    const res = await apiRequest<CoursesResponse>("/courses");
    return res.data;
  },

  /**
   * GET /tracks/{idOrSlug}/modules
   * Handles both unwrapped and wrapped { data: TrackModulesResponse } envelopes defensively.
   */
  getTrackModules: async (trackIdOrSlug: string | number): Promise<TrackModulesResponse> => {
    const res = await apiRequest<TrackModulesResponse | ApiResponseEnvelope<TrackModulesResponse>>(
      `/tracks/${trackIdOrSlug}/modules`
    );
    return "data" in res && res.data ? res.data : (res as TrackModulesResponse);
  },

  /**
   * GET /modules/{idOrSlug}/units
   * Handles both unwrapped and wrapped { data: ModuleUnitsResponse } envelopes defensively.
   */
  getModuleUnits: async (moduleIdOrSlug: string | number): Promise<ModuleUnitsResponse> => {
    const res = await apiRequest<ModuleUnitsResponse | ApiResponseEnvelope<ModuleUnitsResponse>>(
      `/modules/${moduleIdOrSlug}/units`
    );
    return "data" in res && res.data ? res.data : (res as ModuleUnitsResponse);
  },

  /**
   * GET /units/{slug}
   * Full unit content including video, PDF, discussion prompt.
   */
  getUnit: async (slug: string): Promise<UnitContent> => {
    const res = await apiRequest<UnitContentResponse>(`/units/${slug}`);
    return res.data;
  },
};