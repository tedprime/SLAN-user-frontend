// ── Track summary (nested in GET /courses, or flat in GET /courses/{id}/tracks) ──
// With a Bearer token: progressPercent and completedUnits are personalised.
// Without a token: both are 0.
export interface CourseTrack {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string | null;
  isFree: boolean;
  status: string;
  moduleCount: number;
  unitCount: number;
  totalEstimatedMinutes: number;
  completedUnits: number;
  progressPercent: number;
}

// ── Module summary (GET /tracks/{idOrSlug}/modules) ──────────────────────────
export interface ModuleSummary {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  estimatedReadMinutes: number;
  unitCount: number;
  totalEstimatedMinutes: number;
}

// ── Unit summary (GET /modules/{idOrSlug}/units) ──────────────────────────────
export interface UnitSummary {
  id: number;
  title: string;
  slug: string;
  description: string;
  estimatedReadMinutes: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  status: string;
}

// ── Full unit content (GET /units/{slug}) — requires Bearer token ─────────────
export interface UnitContent extends UnitSummary {
  content?: string; // rich content body
}

// ── Course (GET /courses) ─────────────────────────────────────────────────────
export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string | null;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  tracks: CourseTrack[];
}

// ── Envelope shapes ───────────────────────────────────────────────────────────
export interface CoursesResponse {
  success: boolean;
  data: Course[];
}

export interface TrackModulesResponse {
  track: { id: number; title: string; slug: string };
  modules: ModuleSummary[];
}

export interface ModuleUnitsResponse {
  module: { id: number; title: string; slug: string };
  units: UnitSummary[];
}

export interface UnitContentResponse {
  success: boolean;
  data: UnitContent;
}
