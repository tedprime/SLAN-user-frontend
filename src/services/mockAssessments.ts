import type { Assessment } from "./types/assessment.types";

/**
 * Frontend-only mock assessments, keyed by unit id. Used as a fallback in
 * assessmentService.getUnitAssessment() while the real
 * GET /units/{slug}/assessment endpoint isn't available. Delete this file
 * (and its import in assessmentService.ts) once the backend ships.
 */
export const mockAssessments: Record<number, Assessment> = {
  1: {
    id: "assessment-1",
    unitId: 1,
    title: "Unit 1 Assessment",
    description: "Test your understanding of the key concepts.",
    passingScore: 70,
    timeLimit: 10,
    questions: [
      {
        id: "q1",
        text: "What is the main concept covered in this unit?",
        type: "multiple-choice",
        options: [
          "Option A: Foundational concept",
          "Option B: Advanced technique",
          "Option C: Practical application",
          "Option D: Theoretical framework",
        ],
        correctAnswer: 0,
        explanation: "The main concept is a foundational principle.",
      },
      {
        id: "q2",
        text: "True or False: The principles are universally applicable.",
        type: "true-false",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation: "Context and implementation may vary.",
      },
      {
        id: "q3",
        text: "What is the primary benefit?",
        type: "multiple-choice",
        options: [
          "Improved efficiency",
          "Better decision-making",
          "Enhanced team dynamics",
          "All of the above",
        ],
        correctAnswer: 3,
        explanation: "The concepts provide benefits across multiple dimensions.",
      },
    ],
  },
  // Add more mock assessments here, keyed by unit id, as needed for testing.
};