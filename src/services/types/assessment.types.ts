// ── Assessment types ──────────────────────────────────────────────────────
// Knowledge checks shown after a learner marks a unit complete. Passing
// unlocks "Next"; failing allows unlimited retakes.

export interface Question {
  id: string;
  text: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export interface Assessment {
  id: string;
  unitId: number;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number; // percentage (0-100)
  timeLimit?: number; // in minutes
}

export interface AssessmentResult {
  assessmentId: string;
  unitId: number;
  score: number; // 0-100
  passed: boolean;
  completedAt: string;
  answers: Record<string, number>; // questionId -> selected option index
}