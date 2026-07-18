// Target path in your project: src/services/types/assessment.types.ts
//
// Matches the real Swagger contract:
//   GET  /modules/{moduleId}/assessment   — config only (no questions)
//   GET  /tracks/{trackId}/assessment     — same shape, track-level
//   GET  /courses/{courseId}/assessment   — same shape, course-level
//   GET  /attempts?assessmentType&assessmentId — past attempts
//   POST /attempts/start                  — begins an attempt, returns questions
//   PATCH /attempts/{attemptId}/save      — autosave mid-attempt
//   POST /attempts/{attemptId}/submit     — grades the attempt
//   GET  /attempts/{attemptId}/result     — full per-question breakdown

export type AssessmentType =
  | "module_assessment"
  | "track_assessment"
  | "course_assessment";

// ── Config (shown before starting an attempt) ──────────────────────────

export interface AssessmentConfig {
  id: number;
  moduleId?: number;
  title: string;
  description: string;
  passMarkPercent: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  isActive: boolean;
  questionCount: number;
  hasTakenAssessment: boolean;
  userHighestScore: number | null;
}

export interface AssessmentConfigResponse {
  success: boolean;
  data: AssessmentConfig;
}

// ── Past attempts (GET /attempts?assessmentType=&assessmentId=) ───────

export interface AttemptSummary {
  attemptId: number;
  status: string; // "completed" | "in_progress" | ...
  score: number;
  percentage: number;
  passed: boolean;
}

export interface AttemptListResponse {
  success: boolean;
  data: AttemptSummary[];
}

// ── Starting an attempt (POST /attempts/start) ─────────────────────────

export interface StartAttemptPayload {
  assessmentType: AssessmentType;
  assessmentId: number; // the assessment's own id (config.id), not moduleId
}

export interface AttemptOption {
  id: string;
  text: string;
}

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export interface AttemptQuestion {
  id: number;
  questionText: string;
  questionType: QuestionType;
  options: AttemptOption[]; // empty for short_answer
  points: number;
}

export interface AttemptStart {
  attemptId: number;
  assessmentType: AssessmentType;
  assessmentId: number;
  startedAt: string;
  expiresAt: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  questions: AttemptQuestion[];
}

export interface AttemptStartResponse {
  success: boolean;
  data: AttemptStart;
}

// ── Answering ───────────────────────────────────────────────────────────
// For multiple_choice / true_false: `answer` is the option UUID.
// For short_answer: `answer` is plain text.
// Omit an entry entirely to skip a question (scores 0 for it).

export interface AttemptAnswerInput {
  questionId: number;
  answer: string;
}

// ── Autosave (PATCH /attempts/{attemptId}/save) ────────────────────────

export interface SaveAttemptPayload {
  answers: AttemptAnswerInput[];
}

export interface SaveAttemptResult {
  saved: number;
  expiresAt: string;
}

// ── Submit (POST /attempts/{attemptId}/submit) ─────────────────────────
// Score only — no per-question breakdown. Fetch that separately via
// getAttemptResult().

export interface SubmitAttemptPayload {
  answers: AttemptAnswerInput[];
}

export interface SubmitAttemptResult {
  attemptId: number;
  expired: boolean;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passMarkPercent: number;
  message: string;
}

// ── Full result (GET /attempts/{attemptId}/result) ─────────────────────

export interface AttemptResultAnswer {
  questionId: number;
  questionText: string;
  questionType: string;
  options: AttemptOption[];
  yourAnswer: string | null;
  yourAnswerText: string | null;
  correctAnswerText: string;
  isCorrect: boolean;
  pointsAwarded: number;
  explanation?: string;
}

export interface AttemptResult {
  attemptId: number;
  status: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: AttemptResultAnswer[];
}

export interface AttemptResultResponse {
  success: boolean;
  data: AttemptResult;
}
