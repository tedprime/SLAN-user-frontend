// Target path in your project: src/services/types/assessment.types.ts
//
// Shapes are inferred from the admin config schema you shared
// (title, description, passMarkPercent, maxAttempts, timeLimitMinutes,
// isActive) plus a student-facing question/answer/result layer on top.
// Adjust field names here once the real student-facing endpoints are
// finalized — everything else (service + UI) reads through these types,
// so a mismatch is a one-file fix.

// ── Taking the assessment ──────────────────────────────────────────────
// GET /modules/{moduleId}/assessment — questions only, never correct answers.

export interface AssessmentOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  options: AssessmentOption[];
}

export interface ModuleAssessment {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  passMarkPercent: number;
  maxAttempts: number;
  timeLimitMinutes: number; // 0 = no time limit
  attemptsUsed: number;
  questions: AssessmentQuestion[];
}

// ── Submitting ──────────────────────────────────────────────────────────
// POST /modules/{moduleId}/assessment/submit

export interface AssessmentAnswer {
  questionId: number;
  selectedOptionId: string | null;
}

export interface AssessmentSubmitPayload {
  answers: AssessmentAnswer[];
  timeTakenSeconds: number;
}

export interface AssessmentReviewItem {
  questionId: number;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface AssessmentResult {
  score: number; // percent, 0-100
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  passMarkPercent: number;
  timeTakenSeconds: number;
  percentile?: number;
  attemptsUsed: number;
  maxAttempts: number;
  review: AssessmentReviewItem[];
}

// ── Envelopes (defensive — mirrors the wrapped/unwrapped handling
// already used in courseService.ts) ───────────────────────────────────

export interface ModuleAssessmentResponse {
  success: boolean;
  data: ModuleAssessment;
}

export interface AssessmentResultResponse {
  success: boolean;
  data: AssessmentResult;
}