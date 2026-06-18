import { apiRequest } from "./api";
import type { Course, CoursesResponse, Track, TracksResponse } from "./types/course.types";

export const courseService = {
  /**
   * Published courses, each with its tracks nested inline
   * (id, title, slug, isFree, status) — exactly what the
   * dashboard sidebar dropdown needs, no extra round trip.
   */
  getCourses: async (): Promise<Course[]> => {
    const res = await apiRequest<CoursesResponse>("/courses");
    return res.data;
  },

  /**
   * Published tracks with their modules nested inline. Not used by the
   * sidebar today, but the backend already exposes it and a track detail
   * view will need it next.
   */
  getTracks: async (): Promise<Track[]> => {
    const res = await apiRequest<TracksResponse>("/tracks");
    return res.data;
  },
};