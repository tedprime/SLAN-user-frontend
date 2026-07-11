// Target path in your project: src/pages/dashboard/components/AssessmentView.tsx
//
// Full-screen takeover (no sidebar/header) rendered directly by
// UserDashboard.tsx when activeNav starts with "assessment:".
import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Bookmark,
  Award,
  TrendingUp,
  ClipboardCheck,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { assessmentService } from "../../../services/assessmentService";
import type {
  ModuleAssessment,
  AssessmentResult,
  AssessmentSubmitPayload,
} from "../../../services/types/assessment.types";

interface AssessmentViewProps {
  moduleId: number;
  moduleTitle: string;
  courseName: string;
  trackName: string;
  /** Close without finishing — e.g. the X icon or "Save & Exit". */
  onExit: () => void;
  /** "Finish & Continue" from the results screen. */
  onFinish: () => void;
}

const MOBILE_BP = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BP);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getGradeLabel(score: number, passed: boolean): string {
  if (!passed) return "Not Yet Passed";
  if (score >= 90) return "Distinction";
  if (score >= 75) return "Merit";
  return "Pass";
}

type Phase = "loading" | "error" | "taking" | "submitting" | "results";

export default function AssessmentView({
  moduleId,
  moduleTitle,
  courseName,
  trackName,
  onExit,
  onFinish,
}: AssessmentViewProps) {
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState<Phase>("loading");
  const [assessment, setAssessment] = useState<ModuleAssessment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitError, setSubmitError] = useState(false);

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const elapsedRef = useRef(0);

  const loadAssessment = useCallback(async () => {
    setPhase("loading");
    try {
      const data = await assessmentService.getModuleAssessment(moduleId);
      setAssessment(data);
      setAnswers({});
      setMarkedForReview(new Set());
      setCurrentIndex(0);
      setResult(null);
      setSubmitError(false);
      elapsedRef.current = 0;
      setSecondsRemaining(data.timeLimitMinutes > 0 ? data.timeLimitMinutes * 60 : null);
      setPhase("taking");
    } catch {
      setPhase("error");
    }
  }, [moduleId]);

  useEffect(() => {
    // Fetch-on-mount/moduleId-change. loadAssessment sets phase
    // synchronously before its first await (to show a loading state
    // immediately) — intentional, not an accidental cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssessment();
  }, [loadAssessment]);

  const handleSubmit = useCallback(async () => {
    if (!assessment) return;
    setPhase("submitting");
    setSubmitError(false);
    const payload: AssessmentSubmitPayload = {
      answers: (Array.isArray(assessment.questions) ? assessment.questions : []).map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] ?? null,
      })),
      timeTakenSeconds: elapsedRef.current,
    };
    try {
      const res = await assessmentService.submitAssessment(moduleId, payload);
      setResult(res);
      setPhase("results");
    } catch {
      setSubmitError(true);
      setPhase("taking");
    }
  }, [assessment, answers, moduleId]);

  // Ticking clock while the assessment is in progress.
  useEffect(() => {
    if (phase !== "taking") return;
    const interval = setInterval(() => {
      elapsedRef.current += 1;
      setSecondsRemaining((r) => (r === null ? null : Math.max(0, r - 1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Auto-submit when a time limit runs out.
  useEffect(() => {
    if (phase === "taking" && secondsRemaining === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSubmit();
    }
  }, [secondsRemaining, phase, handleSubmit]);

  if (phase === "loading") {
    return (
      <FullScreenMessage>
        <Spinner />
        <p style={{ fontSize: "14px", color: "#888888" }}>Loading assessment...</p>
      </FullScreenMessage>
    );
  }

  if (phase === "error" || !assessment) {
    return (
      <FullScreenMessage>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>
          Failed to load assessment
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="primary" size="sm" onClick={loadAssessment}>
            Retry
          </Button>
          <Button variant="outlined" size="sm" onClick={onExit}>
            Back
          </Button>
        </div>
      </FullScreenMessage>
    );
  }

  if (phase === "submitting") {
    return (
      <FullScreenMessage>
        <Spinner />
        <p style={{ fontSize: "14px", color: "#888888" }}>Grading your assessment...</p>
      </FullScreenMessage>
    );
  }

  if (phase === "results" && result) {
    return (
      <ResultsScreen
        isMobile={isMobile}
        moduleTitle={moduleTitle}
        result={result}
        onExit={onExit}
        onFinish={onFinish}
        onRetry={
          !result.passed && result.attemptsUsed < result.maxAttempts ? loadAssessment : undefined
        }
      />
    );
  }

  // ── Taking phase ────────────────────────────────────────────────────
  const questions = Array.isArray(assessment.questions) ? assessment.questions : [];

  if (questions.length === 0) {
    return (
      <FullScreenMessage>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#101b37", marginBottom: "4px" }}>
          This assessment has no questions yet
        </p>
        <p style={{ fontSize: "13px", color: "#888888", marginBottom: "8px" }}>
          Check back once it's been configured.
        </p>
        <Button variant="outlined" size="sm" onClick={onExit}>
          Back
        </Button>
      </FullScreenMessage>
    );
  }

  const question = questions[currentIndex];
  const total = questions.length;
  const isLastQuestion = currentIndex === total - 1;
  const percentComplete = Math.round(((currentIndex + 1) / total) * 100);
  const isMarked = markedForReview.has(question.id);

  const toggleMarked = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  };

  return (
    <div
      style={{
        height: "100dvh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafafa",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "14px 16px" : "16px 32px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
          <button
            onClick={onExit}
            aria-label="Exit assessment"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#444444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              flexShrink: 0,
            }}
          >
            <X size={20} />
          </button>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#101b37",
                fontFamily: "var(--font-headline)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {courseName}
            </p>
            <p style={{ fontSize: "12px", color: "#888888" }}>{trackName} • Assessment</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {secondsRemaining !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 700,
                color: secondsRemaining < 60 ? "#d32f2f" : "#101b37",
              }}
            >
              <Clock size={14} />
              {formatTime(secondsRemaining)}
            </div>
          )}
          {!isMobile && (
            <button
              onClick={onExit}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#888888",
              }}
            >
              Save &amp; Exit
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ maxWidth: "820px", margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 32px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#006400",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Question {currentIndex + 1} of {total}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "6px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontSize: isMobile ? "22px" : "28px",
                fontWeight: 800,
                color: "#101b37",
                fontFamily: "var(--font-headline)",
                letterSpacing: "-0.02em",
              }}
            >
              {assessment.title || moduleTitle}
            </h1>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#888888", whiteSpace: "nowrap" }}>
              {percentComplete}% Complete
            </span>
          </div>

          <div
            style={{
              height: "6px",
              borderRadius: "9999px",
              backgroundColor: "#e8e8e8",
              overflow: "hidden",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percentComplete}%`,
                backgroundColor: "#006400",
                borderRadius: "9999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {submitError && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "#fdecea",
                border: "1px solid #f5c6c0",
                color: "#d32f2f",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              Couldn't submit your assessment. Please try again.
            </div>
          )}

          {/* Question card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: "12px",
              padding: isMobile ? "20px" : "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#101b37", lineHeight: 1.5, marginBottom: "24px" }}>
              {question.text}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(Array.isArray(question.options) ? question.options : []).map((option) => {
                const isSelected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      textAlign: "left",
                      padding: "16px",
                      borderRadius: "10px",
                      border: `1px solid ${isSelected ? "#006400" : "#e0e0e0"}`,
                      backgroundColor: isSelected ? "rgba(0,100,0,0.04)" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        minWidth: "18px",
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? "#006400" : "#d1d1d1"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <span
                          style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "50%",
                            backgroundColor: "#006400",
                          }}
                        />
                      )}
                    </span>
                    <span style={{ fontSize: "14px", color: "#444444", lineHeight: 1.5 }}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div
        style={{
          flexShrink: 0,
          padding: isMobile ? "12px 16px" : "16px 32px",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "820px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={14} />
            {!isMobile && "Previous"}
          </Button>

          <button
            onClick={toggleMarked}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: `1px solid ${isMarked ? "#d4af37" : "#e0e0e0"}`,
              backgroundColor: isMarked ? "rgba(212,175,55,0.08)" : "transparent",
              color: isMarked ? "#b8941f" : "#888888",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Bookmark size={14} fill={isMarked ? "#d4af37" : "none"} />
            {!isMobile && (isMarked ? "Marked" : "Mark for Review")}
          </button>

          {isLastQuestion ? (
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              <ClipboardCheck size={14} />
              Submit
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            >
              Next Question
              <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Results screen ─────────────────────────────────────────────────────

function ResultsScreen({
  isMobile,
  moduleTitle,
  result,
  onExit,
  onFinish,
  onRetry,
}: {
  isMobile: boolean;
  moduleTitle: string;
  result: AssessmentResult;
  onExit: () => void;
  onFinish: () => void;
  onRetry?: () => void;
}) {
  const gradeLabel = getGradeLabel(result.score, result.passed);
  const incorrectCount = result.totalQuestions - result.correctCount;
  const ringColor = result.passed ? "#10b981" : "#d32f2f";

  return (
    <div style={{ height: "100dvh", width: "100vw", display: "flex", flexDirection: "column", backgroundColor: "#fafafa" }}>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-end",
          padding: isMobile ? "14px 16px" : "16px 32px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <button
          onClick={onExit}
          aria-label="Close"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#444444" }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{ maxWidth: "820px", margin: "0 auto", padding: isMobile ? "20px 16px 40px" : "32px 32px 48px" }}>
          {/* Banner */}
          <div
            style={{
              borderRadius: "16px",
              padding: isMobile ? "28px 20px" : "40px",
              textAlign: "center",
              marginBottom: "24px",
              background: result.passed
                ? "linear-gradient(135deg, #006400, #003300)"
                : "linear-gradient(135deg, #444444, #1a1a1a)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.15)",
                padding: "6px 14px",
                borderRadius: "9999px",
                marginBottom: "16px",
              }}
            >
              Assessment {result.passed ? "Complete" : "Not Passed"}
            </span>
            <h1
              style={{
                fontSize: isMobile ? "24px" : "30px",
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: "var(--font-headline)",
                marginBottom: "10px",
              }}
            >
              {moduleTitle}
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
              {result.passed
                ? "Nice work! Your score clears the pass mark for this module."
                : `You didn't quite reach the ${result.passMarkPercent}% pass mark this time. Review the answers below and try again.`}
            </p>
          </div>

          {/* Score + stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "12px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  background: `conic-gradient(${ringColor} ${result.score * 3.6}deg, #e8e8e8 0deg)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "112px",
                    height: "112px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "26px", fontWeight: 800, color: "#101b37" }}>
                    {result.score}%
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#888888", letterSpacing: "0.05em" }}>
                    SCORE
                  </span>
                </div>
              </div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: ringColor, marginBottom: "2px" }}>
                {gradeLabel}
              </p>
              <p style={{ fontSize: "12px", color: "#888888" }}>
                Required to pass: {result.passMarkPercent}%
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <StatBox
                icon={<CheckCircle2 size={16} style={{ color: "#10b981" }} />}
                label="Correct Answers"
                value={`${result.correctCount} / ${result.totalQuestions}`}
              />
              <StatBox
                icon={<XCircle size={16} style={{ color: "#d32f2f" }} />}
                label="Incorrect Answers"
                value={`${incorrectCount} / ${result.totalQuestions}`}
              />
              <StatBox
                icon={<Clock size={16} style={{ color: "#3b82f6" }} />}
                label="Time Taken"
                value={formatTime(result.timeTakenSeconds)}
              />
              {typeof result.percentile === "number" ? (
                <StatBox
                  icon={<TrendingUp size={16} style={{ color: "#8b5cf6" }} />}
                  label="Percentile"
                  value={`Top ${100 - result.percentile}%`}
                />
              ) : (
                <StatBox
                  icon={<Award size={16} style={{ color: "#8b5cf6" }} />}
                  label="Attempts Used"
                  value={`${result.attemptsUsed} / ${result.maxAttempts}`}
                />
              )}
            </div>
          </div>

          {/* Review answers */}
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "#101b37",
              fontFamily: "var(--font-headline)",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ClipboardCheck size={18} />
            Review Answers
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            {(Array.isArray(result.review) ? result.review : []).map((item, index) => (
              <div
                key={item.questionId}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e8e8e8",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0 }}>
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        minWidth: "22px",
                        borderRadius: "50%",
                        backgroundColor: item.isCorrect ? "#10b981" : "#d32f2f",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {index + 1}
                    </span>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#101b37", lineHeight: 1.5 }}>
                      {item.questionText}
                    </p>
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      color: item.isCorrect ? "#0a7a3d" : "#d32f2f",
                      backgroundColor: item.isCorrect ? "rgba(16,185,129,0.1)" : "rgba(211,47,47,0.08)",
                    }}
                  >
                    {item.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "#666666", marginTop: "12px", marginLeft: "34px" }}>
                  Your Answer: {item.selectedOptionText || "No answer"}
                </p>
                {!item.isCorrect && (
                  <p style={{ fontSize: "13px", color: "#10b981", fontWeight: 600, marginTop: "4px", marginLeft: "34px" }}>
                    Correct Answer: {item.correctOptionText}
                  </p>
                )}

                {item.feedback && (
                  <div
                    style={{
                      marginTop: "12px",
                      marginLeft: "34px",
                      padding: "12px 16px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      borderLeft: `3px solid ${item.isCorrect ? "#10b981" : "#d32f2f"}`,
                    }}
                  >
                    <p style={{ fontSize: "12px", fontWeight: 700, color: item.isCorrect ? "#0a7a3d" : "#d32f2f", marginBottom: "4px" }}>
                      {item.isCorrect ? "Feedback" : "Concept Review"}
                    </p>
                    <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5 }}>{item.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions — module assessments don't issue a certificate,
              only track/course assessments do. */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            {onRetry && (
              <Button variant="outlined" size="md" onClick={onRetry}>
                Retry Assessment
              </Button>
            )}
            {(result.passed || !onRetry) && (
              <Button variant="primary" size="md" onClick={onFinish}>
                {result.passed ? "Finish & Continue" : "Back to Track"}
                <ChevronRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>{label}</span>
        {icon}
      </div>
      <p style={{ fontSize: "18px", fontWeight: 800, color: "#101b37" }}>{value}</p>
    </div>
  );
}

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: "100dvh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        backgroundColor: "#fafafa",
      }}
    >
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "3px solid #e8e8e8",
        borderTopColor: "#006400",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );
}