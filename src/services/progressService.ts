import { apiRequest } from "./api";

export interface ModuleProgress {
  moduleId: number;
  totalUnits: number;
  completedUnits: number;
  progressPercent: number;
  isCompleted: boolean;
  completedUnitIds: number[];
}

export interface TrackProgress {
  trackId: number;
  totalModules: number;
  completedModules: number;
  totalUnits: number;
  completedUnits: number;
  progressPercent: number;
  isCompleted: boolean;
}

export interface CourseProgress {
  courseId: number;
  totalTracks: number;
  completedTracks: number;
  totalModules: number;
  completedModules: number;
  totalUnits: number;
  completedUnits: number;
  progressPercent: number;
  isCompleted: boolean;
}

export interface CompletedUnitEntry {
  unitId: number;
  completedAt: string;
}

export const progressService = {
  /**
   * POST /progress/units/{unitId}/complete
   * Safe to call multiple times — duplicates are silently ignored by the API.
   */
  markUnitComplete: (unitId: number) =>
    apiRequest<{ message?: string }>(`/progress/units/${unitId}/complete`, {
      method: "POST",
    }),

  /**
   * GET /progress/modules/{moduleId}
   */
  getModuleProgress: (moduleId: number) =>
    apiRequest<ModuleProgress>(`/progress/modules/${moduleId}`),

  /**
   * GET /progress/tracks/{trackId}
   */
  getTrackProgress: (trackId: number) =>
    apiRequest<TrackProgress>(`/progress/tracks/${trackId}`),

  /**
   * GET /progress/tracks/{trackId}/completed-units
   * Array of { unitId, completedAt } for every completed unit in the track.
   * This is the cheapest way to know exactly which units (and therefore
   * which modules) are complete for a whole track in one call.
   */
  getTrackCompletedUnits: (trackId: number) =>
    apiRequest<CompletedUnitEntry[]>(`/progress/tracks/${trackId}/completed-units`),

  /**
   * GET /progress/courses/{courseId}
   */
  getCourseProgress: (courseId: number) =>
    apiRequest<CourseProgress>(`/progress/courses/${courseId}`),
};