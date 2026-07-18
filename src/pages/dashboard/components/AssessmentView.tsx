// Target path in your project: src/pages/dashboard/components/AssessmentView.tsx
//
// Full-screen takeover (no sidebar/header) rendered directly by
// UserDashboard.tsx when activeNav starts with "assessment:".
//
// Rewritten to match the real Swagger-backed contract in
// assessmentService.ts / assessment.types.ts:
//   1. GET  /modules/{moduleId}/assessment   -> config only (no questions)
//   2. GET  /attempts?...                    -> past attempts (for attempts-used)
//   3. POST /attempts/start                  -> begins an attempt, returns questions
//   4. PATCH /attempts/{attemptId}/save      -> best-effort autosave
//   5. POST /attempts/{attemptId}/submit     -> score only, no breakdown
//   6. GET  /attempts/{attemptId}/result     -> full per-question breakdown
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
  ClipboardCheck,
  PlayCircle,
  Layers,
  Target,
  RotateCcw,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { assessmentService } from "../../../services/assessmentService";
import type {
  AssessmentConfig,
  AssessmentType,
  AttemptSummary,
  AttemptStart,
  AttemptAnswerInput,
  SubmitAttemptResult,
  AttemptResult,
} from "../../../services/types/assessment.types";

interface AssessmentViewProps {
  /**
   * Exactly one of moduleId / trackId is provided depending on scope.
   * moduleId -> module-level assessment (GET /modules/{id}/assessment).
   * trackId  -> track-level assessment (GET /tracks/{id}/assessment),
   * unlocked once every module in the track is completed.
   */
  moduleId?: number;
  trackId?: number;
  /** Title shown on the intro/quiz header — module title or track title. */
  moduleTitle: string;
  /** Position of this module within its track (1-based), used in the exam header. Module scope only. */
  moduleNumber?: number;
  courseName: string;
  trackName: string;
  /** Close without finishing — e.g. the X icon or "Save & Exit". */
  onExit: () => void;
  /** "Finish & Continue" from the results screen. */
  onFinish: () => void;
  /**
   * Fired whenever the exam-taking phases (taking/submitting/results) begin
   * or end, so the parent dashboard can hide its sidebar for those phases
   * and keep the sidebar visible on the intro screen.
   */
  onExamActiveChange?: (active: boolean) => void;
}

// Scope is derived per-instance from which id prop is provided (see
// ASSESSMENT_TYPE inside the component below).

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

function getGradeLabel(percentage: number, passed: boolean): string {
  if (!passed) return "Not Yet Passed";
  if (percentage >= 90) return "Distinction";
  if (percentage >= 75) return "Merit";
  return "Pass";
}

function secondsUntil(isoDate: string): number {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

function buildAnswersPayload(answers: Record<number, string>): AttemptAnswerInput[] {
  // Omit unanswered questions entirely, per the API contract (they score 0).
  return Object.entries(answers)
    .filter(([, value]) => value !== undefined && value !== null && value.trim() !== "")
    .map(([questionId, answer]) => ({ questionId: Number(questionId), answer }));
}

// ── Local persistence: resume-in-progress + attempts cooldown ──────────
// The API contract has no "resume" or "attempt history with timestamps"
// endpoint, so both of these are tracked client-side in localStorage,
// keyed by the assessment's own id (config.id).

const PROGRESS_STORAGE_PREFIX = "slan_assessment_progress_";
const COOLDOWN_STORAGE_PREFIX = "slan_assessment_cooldown_";
const COOLDOWN_HOURS = 24;

interface SavedProgress {
  attempt: AttemptStart;
  answers: Record<number, string>;
  markedForReview: number[];
  currentIndex: number;
  savedAt: string;
}

function readSavedProgress(assessmentId: number): SavedProgress | null {
  try {
    const raw = localStorage.getItem(`${PROGRESS_STORAGE_PREFIX}${assessmentId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedProgress;
    // Discard silently if the attempt's time window already ran out.
    if (parsed.attempt?.expiresAt && secondsUntil(parsed.attempt.expiresAt) <= 0) {
      localStorage.removeItem(`${PROGRESS_STORAGE_PREFIX}${assessmentId}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSavedProgress(assessmentId: number, progress: SavedProgress) {
  try {
    localStorage.setItem(`${PROGRESS_STORAGE_PREFIX}${assessmentId}`, JSON.stringify(progress));
  } catch {
    // Storage may be unavailable (private mode, quota) — non-critical.
  }
}

function clearSavedProgress(assessmentId: number) {
  try {
    localStorage.removeItem(`${PROGRESS_STORAGE_PREFIX}${assessmentId}`);
  } catch {
    // ignore
  }
}

function readCooldownUntil(assessmentId: number): string | null {
  try {
    return localStorage.getItem(`${COOLDOWN_STORAGE_PREFIX}${assessmentId}`);
  } catch {
    return null;
  }
}

function writeCooldownUntil(assessmentId: number, isoDate: string) {
  try {
    localStorage.setItem(`${COOLDOWN_STORAGE_PREFIX}${assessmentId}`, isoDate);
  } catch {
    // ignore
  }
}

function clearCooldown(assessmentId: number) {
  try {
    localStorage.removeItem(`${COOLDOWN_STORAGE_PREFIX}${assessmentId}`);
  } catch {
    // ignore
  }
}

function formatCooldownRemaining(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

type Phase = "loading" | "error" | "none" | "intro" | "taking" | "submitting" | "results";

export default function AssessmentView({
  moduleId,
  trackId,
  moduleTitle,
  moduleNumber,
  courseName,
  trackName,
  onExit,
  onFinish,
  onExamActiveChange,
}: AssessmentViewProps) {
  const isMobile = useIsMobile();

  // Track scope takes precedence when both would somehow be provided.
  const ASSESSMENT_TYPE: AssessmentType = trackId != null ? "track_assessment" : "module_assessment";
  const entityId = trackId != null ? trackId : moduleId;

  const [phase, setPhase] = useState<Phase>("loading");
  const [config, setConfig] = useState<AssessmentConfig | null>(null);
  const [pastAttempts, setPastAttempts] = useState<AttemptSummary[]>([]);

  const [attempt, setAttempt] = useState<AttemptStart | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());

  const [submitResult, setSubmitResult] = useState<SubmitAttemptResult | null>(null);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [submitError, setSubmitError] = useState(false);
  const [startError, setStartError] = useState(false);

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const elapsedRef = useRef(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resume-in-progress + manual save feedback.
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);
  const [saveNotice, setSaveNotice] = useState<"idle" | "saving" | "saved">("idle");
  const saveNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Attempts-exhausted cooldown (24h, tracked client-side).
  const [cooldownEndsAt, setCooldownEndsAt] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Keep the cooldown countdown roughly fresh while looking at the intro screen.
  useEffect(() => {
    if (phase !== "intro") return;
    const id = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(id);
  }, [phase]);

  // ── Load config + past attempts ────────────────────────────────────
  const loadIntro = useCallback(async () => {
    setPhase("loading");
    setStartError(false);
    try {
      if (entityId == null) {
        setPhase("error");
        return;
      }
      const cfg =
        trackId != null
          ? await assessmentService.getTrackAssessmentConfig(trackId)
          : await assessmentService.getModuleAssessmentConfig(moduleId!);
      setConfig(cfg);
      if (!cfg) {
        setPhase("none");
        return;
      }
      setSavedProgress(readSavedProgress(cfg.id));

      let usedCount = 0;
      try {
        const attempts = await assessmentService.listAttempts(ASSESSMENT_TYPE, cfg.id);
        const list = Array.isArray(attempts) ? attempts : [];
        setPastAttempts(list);
        usedCount = list.length;
      } catch {
        // Non-fatal — attempts history just won't show.
        setPastAttempts([]);
      }

      // Cooldown bookkeeping: start the 24h clock the first time attempts
      // are found exhausted, and clear it once that window has elapsed.
      const exhausted = cfg.maxAttempts > 0 && usedCount >= cfg.maxAttempts;
      if (exhausted) {
        const existing = readCooldownUntil(cfg.id);
        if (!existing) {
          const until = new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
          writeCooldownUntil(cfg.id, until);
          setCooldownEndsAt(until);
        } else if (new Date(existing).getTime() <= Date.now()) {
          clearCooldown(cfg.id);
          setCooldownEndsAt(null);
        } else {
          setCooldownEndsAt(existing);
        }
      } else {
        clearCooldown(cfg.id);
        setCooldownEndsAt(null);
      }

      setPhase("intro");
    } catch {
      setPhase("error");
    }
  }, [moduleId, trackId, entityId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadIntro();
  }, [loadIntro]);

  // ── Start a new attempt, or resume a saved in-progress one ──────────
  const handleStart = useCallback(
    async (options?: { resume?: boolean }) => {
      if (!config) return;
      setStartError(false);

      if (options?.resume && savedProgress) {
        setAttempt(savedProgress.attempt);
        setAnswers(savedProgress.answers);
        setMarkedForReview(new Set(savedProgress.markedForReview));
        setCurrentIndex(savedProgress.currentIndex);
        setSubmitResult(null);
        setAttemptResult(null);
        setSubmitError(false);
        elapsedRef.current = 0;
        setSecondsRemaining(
          savedProgress.attempt.expiresAt
            ? secondsUntil(savedProgress.attempt.expiresAt)
            : savedProgress.attempt.timeLimitMinutes > 0
              ? savedProgress.attempt.timeLimitMinutes * 60
              : null
        );
        setPhase("taking");
        return;
      }

      setPhase("loading");
      try {
        const started = await assessmentService.startAttempt({
          assessmentType: ASSESSMENT_TYPE,
          assessmentId: config.id,
        });
        clearSavedProgress(config.id);
        setSavedProgress(null);
        setAttempt(started);
        setAnswers({});
        setMarkedForReview(new Set());
        setCurrentIndex(0);
        setSubmitResult(null);
        setAttemptResult(null);
        setSubmitError(false);
        elapsedRef.current = 0;
        setSecondsRemaining(
          started.expiresAt
            ? secondsUntil(started.expiresAt)
            : started.timeLimitMinutes > 0
              ? started.timeLimitMinutes * 60
              : null
        );
        setPhase("taking");
      } catch {
        setStartError(true);
        setPhase("intro");
      }
    },
    [config, savedProgress, trackId]
  );

  // ── Submit the attempt ──────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!attempt) return;
    setPhase("submitting");
    setSubmitError(false);
    try {
      const res = await assessmentService.submitAttempt(attempt.attemptId, {
        answers: buildAnswersPayload(answers),
      });
      clearSavedProgress(attempt.assessmentId);
      setSavedProgress(null);
      setSubmitResult(res);
      // Full per-question breakdown is a separate call — best effort, the
      // results screen still works with just the summary if this fails.
      try {
        const full = await assessmentService.getAttemptResult(attempt.attemptId);
        setAttemptResult(full);
      } catch {
        setAttemptResult(null);
      }
      // Refresh attempts-used count so a retry offer reflects reality.
      if (config) {
        try {
          const attempts = await assessmentService.listAttempts(ASSESSMENT_TYPE, config.id);
          setPastAttempts(Array.isArray(attempts) ? attempts : []);
        } catch {
          // ignore
        }
      }
      setPhase("results");
    } catch {
      setSubmitError(true);
      setPhase("taking");
    }
  }, [attempt, answers, config, trackId]);

  // ── Best-effort autosave, debounced on answer changes ───────────────
  useEffect(() => {
    if (phase !== "taking" || !attempt) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      assessmentService
        .saveAttempt(attempt.attemptId, { answers: buildAnswersPayload(answers) })
        .catch(() => {
          // Autosave failures are non-critical, swallow per service contract.
        });
    }, 1500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, phase, attempt]);

  useEffect(() => {
    return () => {
      if (saveNoticeTimeoutRef.current) clearTimeout(saveNoticeTimeoutRef.current);
    };
  }, []);

  // ── Manual "Save" — persists progress but keeps the person on the quiz ──
  const handleSaveProgress = useCallback(async () => {
    if (!attempt) return;
    setSaveNotice("saving");
    writeSavedProgress(attempt.assessmentId, {
      attempt,
      answers,
      markedForReview: Array.from(markedForReview),
      currentIndex,
      savedAt: new Date().toISOString(),
    });
    try {
      await assessmentService.saveAttempt(attempt.attemptId, {
        answers: buildAnswersPayload(answers),
      });
    } catch {
      // Progress is still kept locally even if the backend save fails.
    } finally {
      setSaveNotice("saved");
      if (saveNoticeTimeoutRef.current) clearTimeout(saveNoticeTimeoutRef.current);
      saveNoticeTimeoutRef.current = setTimeout(() => setSaveNotice("idle"), 2000);
    }
  }, [attempt, answers, markedForReview, currentIndex]);

  // ── "Save & Exit" — persists progress, then leaves the module entirely ──
  const handleSaveAndExit = useCallback(() => {
    if (attempt) {
      writeSavedProgress(attempt.assessmentId, {
        attempt,
        answers,
        markedForReview: Array.from(markedForReview),
        currentIndex,
        savedAt: new Date().toISOString(),
      });
      assessmentService
        .saveAttempt(attempt.attemptId, { answers: buildAnswersPayload(answers) })
        .catch(() => {});
    }
    onExit();
  }, [attempt, answers, markedForReview, currentIndex, onExit]);

  // ── X icon in the quiz/results — goes back to the assessment page, ──
  // ── not out of the assessment flow entirely. ────────────────────────
  const handleExitToIntro = useCallback(() => {
    if (attempt && phase === "taking") {
      writeSavedProgress(attempt.assessmentId, {
        attempt,
        answers,
        markedForReview: Array.from(markedForReview),
        currentIndex,
        savedAt: new Date().toISOString(),
      });
      assessmentService
        .saveAttempt(attempt.attemptId, { answers: buildAnswersPayload(answers) })
        .catch(() => {});
    }
    loadIntro();
  }, [attempt, phase, answers, markedForReview, currentIndex, loadIntro]);

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

  // Sidebar stays visible on the intro screen (and while the config is
  // loading/erroring); once the person actually starts the attempt, the
  // dashboard sidebar hides so only the top header remains.
  useEffect(() => {
    const examActive = phase === "taking" || phase === "submitting" || phase === "results";
    onExamActiveChange?.(examActive);
  }, [phase, onExamActiveChange]);

  useEffect(() => {
    return () => {
      onExamActiveChange?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attemptsUsed = pastAttempts.length;
  const maxAttempts = config?.maxAttempts ?? 0;
  const attemptsExhausted = maxAttempts > 0 && attemptsUsed >= maxAttempts;

  // Once the 24h cooldown has elapsed, treat attempts as reset to 0 for
  // display and unlock the Start button again.
  const cooldownSecondsRemaining = cooldownEndsAt
    ? Math.max(0, Math.floor((new Date(cooldownEndsAt).getTime() - nowTick) / 1000))
    : 0;
  const cooldownActive = attemptsExhausted && cooldownSecondsRemaining > 0;
  const attemptsLocked = attemptsExhausted && cooldownActive;
  const displayAttemptsUsed = attemptsExhausted && !cooldownActive ? 0 : attemptsUsed;

  const highestScore = config?.userHighestScore ?? null;
  const hasPriorAttempts = config?.hasTakenAssessment ?? false;

  if (phase === "loading") {
    return (
      <FullScreenMessage>
        <Spinner />
        <p style={{ fontSize: "14px", color: "#888888" }}>Loading assessment...</p>
      </FullScreenMessage>
    );
  }

  if (phase === "none") {
    return (
      <FullScreenMessage>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#101b37", marginBottom: "4px" }}>
          No assessment configured
        </p>
        <p style={{ fontSize: "13px", color: "#888888", marginBottom: "8px" }}>
          {trackId != null
            ? "This track doesn't have an assessment yet."
            : "This module doesn't have an assessment yet."}
        </p>
        <Button variant="outlined" size="sm" onClick={onExit}>
          Back
        </Button>
      </FullScreenMessage>
    );
  }

  if (phase === "error" || !config) {
    return (
      <FullScreenMessage>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>
          Failed to load assessment
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="primary" size="sm" onClick={loadIntro}>
            Retry
          </Button>
          <Button variant="outlined" size="sm" onClick={onExit}>
            Back
          </Button>
        </div>
      </FullScreenMessage>
    );
  }

  if (phase === "intro") {
    return (
      <IntroScreen
        isMobile={isMobile}
        config={config}
        moduleTitle={moduleTitle}
        courseName={courseName}
        trackName={trackName}
        isTrackAssessment={trackId != null}
        attemptsUsed={displayAttemptsUsed}
        attemptsExhausted={attemptsLocked}
        highestScore={highestScore}
        hasPriorAttempts={hasPriorAttempts}
        hasSavedProgress={!!savedProgress}
        cooldownActive={cooldownActive}
        cooldownRemainingLabel={
          cooldownActive ? formatCooldownRemaining(cooldownSecondsRemaining) : null
        }
        startError={startError}
        onStart={() => handleStart()}
        onContinue={() => handleStart({ resume: true })}
        onDiscardProgress={() => {
          if (config) clearSavedProgress(config.id);
          setSavedProgress(null);
        }}
        onExit={onExit}
      />
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

  if (phase === "results" && submitResult) {
    return (
      <ResultsScreen
        isMobile={isMobile}
        moduleTitle={moduleTitle}
        submitResult={submitResult}
        attemptResult={attemptResult}
        onBackToAssessment={handleExitToIntro}
        onFinish={onFinish}
        onRetry={
          !submitResult.passed && !attemptsLocked ? () => loadIntro() : undefined
        }
      />
    );
  }

  // ── Taking phase ────────────────────────────────────────────────────
  if (!attempt) {
    return (
      <FullScreenMessage>
        <Spinner />
      </FullScreenMessage>
    );
  }

  const questions = Array.isArray(attempt.questions) ? attempt.questions : [];

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
  const percentComplete = Math.round((currentIndex / total) * 100);
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
        height: "100%",
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafafa",
        overflow: "hidden",
        minHeight: 0,
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
            onClick={handleExitToIntro}
            aria-label="Back to assessment page"
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
            <p style={{ fontSize: "12px", color: "#888888", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {trackName}
              {moduleNumber ? ` • Module ${moduleNumber}` : ""}
              {trackId != null ? " • Track Assessment" : " • Assessment"}
            </p>
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
          <button
            onClick={handleSaveProgress}
            disabled={saveNotice === "saving"}
            style={{
              background: "none",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: saveNotice === "saving" ? "default" : "pointer",
              fontSize: "13px",
              fontWeight: 600,
              color: saveNotice === "saved" ? "#006400" : "#444444",
            }}
          >
            {saveNotice === "saved" ? "Saved ✓" : saveNotice === "saving" ? "Saving..." : "Save"}
          </button>
          {!isMobile && (
            <button
              onClick={handleSaveAndExit}
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
              {config.title || moduleTitle}
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
              {question.questionText}
            </p>

            {question.questionType === "short_answer" ? (
              <textarea
                value={answers[question.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                }
                placeholder="Type your answer..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e0e0e0",
                  fontSize: "14px",
                  color: "#101b37",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            ) : (
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
            )}
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

// ── Intro screen ─────────────────────────────────────────────────────
// New screen required by the real contract: config comes back without
// questions, so the person needs an explicit "Start Assessment" step
// (which is also when maxAttempts / isActive can be enforced by the API).

function IntroScreen({
  isMobile,
  config,
  moduleTitle,
  courseName,
  trackName,
  isTrackAssessment,
  attemptsUsed,
  attemptsExhausted,
  highestScore,
  hasPriorAttempts,
  hasSavedProgress,
  cooldownActive,
  cooldownRemainingLabel,
  startError,
  onStart,
  onContinue,
  onDiscardProgress,
  onExit,
}: {
  isMobile: boolean;
  config: AssessmentConfig;
  moduleTitle: string;
  courseName: string;
  trackName: string;
  isTrackAssessment: boolean;
  attemptsUsed: number;
  attemptsExhausted: boolean;
  highestScore: number | null;
  hasPriorAttempts: boolean;
  hasSavedProgress: boolean;
  cooldownActive: boolean;
  cooldownRemainingLabel: string | null;
  startError: boolean;
  onStart: () => void;
  onContinue: () => void;
  onDiscardProgress: () => void;
  onExit: () => void;
}) {
  const disabled = !config.isActive || attemptsExhausted;

  return (
    // Single scroll container — breadcrumb, hero, and info card all scroll
    // together, matching the pattern used in TrackDetailView.tsx.
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        minHeight: 0,
        backgroundColor: "#fafafa",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
      }}
    >
      {/* Breadcrumb */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
        <div className="flex items-center gap-2" style={{ fontSize: "14px" }}>
          <button
            onClick={onExit}
            style={{ color: "#888888", background: "none", border: "none", cursor: "pointer", fontSize: "14px", textTransform: "uppercase" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
          >
            {courseName}
          </button>
          <ChevronRight size={16} style={{ color: "#b0b0b0" }} />
          <span style={{ color: "#101b37", fontWeight: 600, textTransform: "uppercase" }}>
            {trackName}
          </span>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          borderBottom: "1px solid #e0e0e0",
          background: "linear-gradient(135deg, rgba(0,100,0,0.08) 0%, rgba(255,255,255,0.5) 100%)",
          padding: isMobile ? "24px 20px" : "32px 32px",
        }}
      >
        <div style={{ maxWidth: "820px" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#006400",
              backgroundColor: "rgba(0,100,0,0.08)",
              padding: "5px 12px",
              borderRadius: "9999px",
              marginBottom: "14px",
            }}
          >
            {isTrackAssessment ? "Track Assessment" : "Assessment"}
          </span>

          <h1
            style={{
              fontSize: isMobile ? "22px" : "28px",
              fontWeight: 800,
              color: "#101b37",
              fontFamily: "var(--font-headline)",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
              lineHeight: 1.25,
            }}
          >
            {config.title || moduleTitle}
          </h1>

          {config.description && (
            <p style={{ fontSize: "14px", color: "#666666", lineHeight: 1.6, maxWidth: "640px", marginBottom: "20px" }}>
              {config.description}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "14px", color: "#888888", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={16} style={{ color: "#006400" }} />
              <span style={{ fontWeight: 600 }}>{config.questionCount} Questions</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} style={{ color: "#006400" }} />
              <span style={{ fontWeight: 600 }}>
                {config.timeLimitMinutes > 0 ? `${config.timeLimitMinutes} min` : "No time limit"}
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={16} style={{ color: "#006400" }} />
              <span style={{ fontWeight: 600 }}>{config.passMarkPercent}% to pass</span>
            </span>
          </div>
        </div>
      </div>

      {/* Details + start action — regular content, not its own scroll region */}
      <div style={{ padding: isMobile ? "24px 20px" : "32px" }}>
        <div style={{ maxWidth: "820px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <InfoPill label="Questions" value={String(config.questionCount)} />
            <InfoPill
              label="Time Limit"
              value={config.timeLimitMinutes > 0 ? `${config.timeLimitMinutes} min` : "None"}
            />
            <InfoPill label="Pass Mark" value={`${config.passMarkPercent}%`} />
            <InfoPill
              label="Attempts"
              value={
                config.maxAttempts > 0 ? `${attemptsUsed} / ${config.maxAttempts}` : `${attemptsUsed} used`
              }
            />
            {hasPriorAttempts && highestScore !== null && (
              <InfoPill label="Best Score" value={`${Math.round(highestScore)}%`} />
            )}
          </div>

          {!config.isActive && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#d32f2f", marginBottom: "16px" }}>
              <XCircle size={15} />
              This assessment isn't currently open.
            </div>
          )}
          {config.isActive && attemptsExhausted && cooldownActive && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#d32f2f", marginBottom: "16px" }}>
              <RotateCcw size={15} />
              You've used all your attempts. You can try again in {cooldownRemainingLabel}.
            </div>
          )}
          {startError && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#d32f2f", marginBottom: "16px" }}>
              <XCircle size={15} />
              Couldn't start the assessment. Please try again.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "10px" }}>
            {hasSavedProgress ? (
              <>
                <Button variant="primary" size="md" onClick={onContinue} disabled={!config.isActive}>
                  <PlayCircle size={16} />
                  Continue Assessment
                </Button>
                <Button variant="outlined" size="md" onClick={onDiscardProgress} disabled={disabled}>
                  <RotateCcw size={16} />
                  Start Over
                </Button>
              </>
            ) : (
              <Button variant="primary" size="md" onClick={onStart} disabled={disabled}>
                {hasPriorAttempts ? <RotateCcw size={16} /> : <PlayCircle size={16} />}
                {hasPriorAttempts ? "Retry Assessment" : "Start Assessment"}
              </Button>
            )}
          </div>
        </div>

        {/* Bottom padding so content isn't flush against edge on mobile */}
        <div style={{ height: "32px" }} />
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "10px",
        padding: "12px 14px",
      }}
    >
      <p style={{ fontSize: "11px", color: "#888888", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "14px", fontWeight: 700, color: "#101b37" }}>{value}</p>
    </div>
  );
}

// ── Results screen ─────────────────────────────────────────────────────

function ResultsScreen({
  isMobile,
  moduleTitle,
  submitResult,
  attemptResult,
  onBackToAssessment,
  onFinish,
  onRetry,
}: {
  isMobile: boolean;
  moduleTitle: string;
  submitResult: SubmitAttemptResult;
  attemptResult: AttemptResult | null;
  onBackToAssessment: () => void;
  onFinish: () => void;
  onRetry?: () => void;
}) {
  const gradeLabel = getGradeLabel(submitResult.percentage, submitResult.passed);
  const ringColor = submitResult.passed ? "#10b981" : "#d32f2f";
  const review = attemptResult?.answers ?? [];
  const correctCount = review.filter((a) => a.isCorrect).length;
  const incorrectCount = review.length - correctCount;

  return (
    <div style={{ height: "100%", width: "100%", flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#fafafa", minHeight: 0, overflow: "hidden" }}>
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
          onClick={onBackToAssessment}
          aria-label="Back to assessment page"
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
              background: submitResult.passed
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
              Assessment {submitResult.passed ? "Complete" : "Not Passed"}
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
              {submitResult.passed
                ? "Nice work! Your score clears the pass mark for this module."
                : submitResult.message ||
                  `You didn't quite reach the ${submitResult.passMarkPercent}% pass mark this time. Review the answers below and try again.`}
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
                  background: `conic-gradient(${ringColor} ${submitResult.percentage * 3.6}deg, #e8e8e8 0deg)`,
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
                    {Math.round(submitResult.percentage)}%
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
                Required to pass: {submitResult.passMarkPercent}%
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <StatBox
                icon={<CheckCircle2 size={16} style={{ color: "#10b981" }} />}
                label="Points Scored"
                value={`${submitResult.score} / ${submitResult.totalPoints}`}
              />
              {attemptResult ? (
                <StatBox
                  icon={<XCircle size={16} style={{ color: "#d32f2f" }} />}
                  label="Correct / Incorrect"
                  value={`${correctCount} / ${incorrectCount}`}
                />
              ) : (
                <StatBox
                  icon={<Award size={16} style={{ color: "#8b5cf6" }} />}
                  label="Status"
                  value={submitResult.passed ? "Passed" : "Not Passed"}
                />
              )}
              <StatBox
                icon={<Clock size={16} style={{ color: "#3b82f6" }} />}
                label="Attempt"
                value={`#${submitResult.attemptId}`}
              />
              <StatBox
                icon={<Award size={16} style={{ color: "#8b5cf6" }} />}
                label="Result"
                value={submitResult.expired ? "Time Expired" : "Submitted"}
              />
            </div>
          </div>

          {/* Review answers — only available once the full breakdown loads */}
          {review.length > 0 && (
            <>
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
                {review.map((item, index) => (
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
                      Your Answer: {item.yourAnswerText || "No answer"}
                    </p>
                    {!item.isCorrect && (
                      <p style={{ fontSize: "13px", color: "#10b981", fontWeight: 600, marginTop: "4px", marginLeft: "34px" }}>
                        Correct Answer: {item.correctAnswerText}
                      </p>
                    )}

                    {item.explanation && (
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
                        <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5 }}>{item.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
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
            {(submitResult.passed || !onRetry) && (
              <Button variant="primary" size="md" onClick={onFinish}>
                {submitResult.passed ? "Finish & Continue" : "Back to Track"}
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
        height: "100%",
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        backgroundColor: "#fafafa",
        minHeight: 0,
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
