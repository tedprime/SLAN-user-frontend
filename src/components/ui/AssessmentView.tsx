import { useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import Button from "./Button";
import Progress from "./Progress";
import { assessmentService } from "../../services/assessmentService";
import type { Assessment, AssessmentResult } from "../../services/types/assessment.types";

interface AssessmentViewProps {
  assessment: Assessment;
  /** Fires once, when the learner passes and clicks "Continue". */
  onComplete: (result: AssessmentResult) => void;
  /** Learner backs out of the assessment without passing it. */
  onSkip?: () => void;
}

export function AssessmentView({ assessment, onComplete, onSkip }: AssessmentViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  const handleAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      void finishAssessment();
    }
  };

  const finishAssessment = async () => {
    if (submitting) return; // guards against double-submit on a fast double click
    setSubmitting(true);

    let correctCount = 0;
    assessment.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) correctCount++;
    });
    const calculatedScore = Math.round(
      (correctCount / assessment.questions.length) * 100,
    );

    setScore(calculatedScore);
    setShowResults(true);
    setSubmitting(false);

    // Best-effort persistence so attempts show up in progress/analytics.
    // The score shown to the learner is the locally-computed one above —
    // we don't block the results screen on the network, and this silently
    // no-ops if the backend endpoint doesn't exist yet (see assessmentService).
    assessmentService
      .submitAssessment(assessment.id, answers)
      .catch(() => void 0);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const passed = score >= assessment.passingScore;
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            backgroundColor: passed ? "rgba(16,185,129,0.1)" : "rgba(211,47,47,0.08)",
          }}
        >
          {passed ? (
            <CheckCircle2 size={28} style={{ color: "#10b981" }} />
          ) : (
            <RotateCcw size={26} style={{ color: "#d32f2f" }} />
          )}
        </div>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#101b37",
            fontFamily: "var(--font-headline)",
            marginBottom: "8px",
          }}
        >
          {passed ? "Assessment Passed!" : "Keep Learning"}
        </h2>
        <p style={{ fontSize: "16px", color: "#444444", marginBottom: "8px" }}>
          Your score: <strong>{score}%</strong>
        </p>
        <p style={{ fontSize: "13px", color: "#888888", marginBottom: "28px", lineHeight: 1.5 }}>
          {passed
            ? "Nice work — you can move on to the next unit."
            : `You need ${assessment.passingScore}% to pass. Review the material and try again — you can retake as many times as you need.`}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          {!passed && onSkip && (
            <Button variant="outlined" size="md" onClick={onSkip}>
              Back to unit
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (passed) {
                onComplete({
                  assessmentId: assessment.id,
                  unitId: assessment.unitId,
                  score,
                  passed,
                  completedAt: new Date().toISOString(),
                  answers,
                });
              } else {
                handleRetake();
              }
            }}
          >
            {passed ? "Continue" : "Retake Assessment"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Progress */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#101b37" }}>
            Question {currentQuestionIndex + 1} of {assessment.questions.length}
          </span>
          <span style={{ fontSize: "13px", color: "#888888" }}>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} color="#006400" />
      </div>

      {/* Question */}
      <div style={{ marginBottom: "28px" }}>
        <h3
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: "#101b37",
            fontFamily: "var(--font-headline)",
            marginBottom: "20px",
            lineHeight: 1.4,
          }}
        >
          {currentQuestion.text}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {currentQuestion.options.map((option, index) => {
            const selected = answers[currentQuestion.id] === index;
            return (
              <label
                key={index}
                style={{
                  padding: "14px 16px",
                  border: `1.5px solid ${selected ? "#006400" : "#e0e0e0"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  backgroundColor: selected ? "rgba(0,100,0,0.05)" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: "#101b37",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={index}
                  checked={selected}
                  onChange={() => handleAnswer(index)}
                  style={{ accentColor: "#006400" }}
                />
                {option}
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
        {onSkip ? (
          <Button variant="outlined" size="sm" onClick={onSkip}>
            Skip for now
          </Button>
        ) : (
          <span />
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={handleNext}
          disabled={answers[currentQuestion.id] === undefined || submitting}
        >
          {currentQuestionIndex === assessment.questions.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}

export default AssessmentView;