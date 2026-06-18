import { apiRequest } from "./api";
import type {
  Course,
  CoursesResponse,
  TrackModulesResponse,
  ModuleUnitsResponse,
  UnitContent,
  UnitContentResponse,
} from "./types/course.types";

export const courseService = {
  /**
   * GET /courses
   * Published courses, each with track summaries (including progressPercent
   * and completedUnits when a Bearer token is present).
   */
  getCourses: async (): Promise<Course[]> => {
    const res = await apiRequest<CoursesResponse>("/courses");
    return res.data;
  },

  /**
   * GET /tracks/{idOrSlug}/modules
   * All published modules under a track, with unitCount and totalEstimatedMinutes.
   */
  getTrackModules: async (trackIdOrSlug: string | number): Promise<TrackModulesResponse> => {
    return apiRequest<TrackModulesResponse>(`/tracks/${trackIdOrSlug}/modules`);
  },

  /**
   * GET /modules/{idOrSlug}/units
   * All published units under a module (title, slug, description,
   * estimatedReadMinutes, videoUrl, pdfUrl, status).
   */
  getModuleUnits: async (moduleIdOrSlug: string | number): Promise<ModuleUnitsResponse> => {
    return apiRequest<ModuleUnitsResponse>(`/modules/${moduleIdOrSlug}/units`);
  },

  /**
   * GET /units/{slug}
   * Full unit content including video, PDF, discussion prompt.
   * Requires a valid Bearer token (401 if unauthenticated).
   */
  getUnit: async (slug: string): Promise<UnitContent> => {
    const res = await apiRequest<UnitContentResponse>(`/units/${slug}`);
    return res.data;
  },
};