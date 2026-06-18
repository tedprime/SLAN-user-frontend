// ── Modules ─────────────────────────────────────────────
export interface Unit {
  id: number;
  title: string;
  slug: string;
  content?: string;
  duration?: number; // in minutes
  order: number;
  status: string;
}

export interface Module {
  id: number;
  title: string;
  slug: string;
  description: string;
  order: number;
  status: string;
  units: Unit[];
  completed?: boolean;
  locked?: boolean;
}

// ── Tracks ──────────────────────────────────────────────
// Shape returned when tracks come nested inside a course (GET /courses).
export interface CourseTrack {
  id: number;
  title: string;
  slug: string;
  isFree: boolean;
  status: string;
  shortDescription?: string;
  estimatedHours?: number;
  modules: Module[]; // <-- ADDED
}

// Shape returned when fetching tracks directly (GET /tracks) — includes
// nested modules. Not required for the sidebar dropdown, but kept here
// since the same backend resource will likely be needed again soon.
export interface TrackModule {
  id: number;
  title: string;
  slug: string;
  status: string;
}

export interface Track {
  id: number;
  courseId: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string | null;
  isFree: boolean;
  status: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  modules: TrackModule[];
}

// ── Courses ─────────────────────────────────────────────
export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  tracks: CourseTrack[];
}

// ── Envelope shapes (matches the rest of the API) ──────────
export interface CoursesResponse {
  success: boolean;
  data: Course[];
}

export interface TracksResponse {
  success: boolean;
  data: Track[];
}