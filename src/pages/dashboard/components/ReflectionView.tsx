import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight as ChevronSep, Check, Loader2 } from "lucide-react";
import Button from "../../../components/ui/Button";
import { reflectionService } from "../../../services/reflectionService";
import type { ReflectionPrompt, ReflectionResponse } from "../../../services/reflectionService";

interface ReflectionViewProps {
  moduleId: number;
  moduleTitle: string;
  courseName: string;
  trackName: string;
  /** Back to the module's last unit. */
  onBack?: () => void;
  /** Forward to the module's assessment — called both after a successful
   * submit and immediately (no UI shown) when the module has no reflection
   * configured at all. */
  onContinue: () => void;
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

// The my-response endpoint may return one object or an array depending on
// how many prompts the module has — normalize to an array either way.
function normalizeResponses(
  raw: ReflectionResponse[] | ReflectionResponse | null
): ReflectionResponse[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export default function ReflectionView({
  moduleId,
  moduleTitle,
  courseName,
  trackName,
  onBack,
  onContinue,
}: ReflectionViewProps) {
  const isMobile = useIsMobile();

  const [prompts, setPrompts] = useState<ReflectionPrompt[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const reflectionPrompts = await reflectionService.getModuleReflection(moduleId);

        // No reflection configured for this module — skip straight through
        // to the assessment, no page shown.
        if (!reflectionPrompts || reflectionPrompts.length === 0) {
          if (!cancelled) onContinue();
          return;
        }

        const existing = normalizeResponses(
          await reflectionService.getMyReflectionResponse(moduleId)
        );

        if (cancelled) return;
        setPrompts(reflectionPrompts);
        setAnswers(
          Object.fromEntries(existing.map((r) => [r.reflectionId, r.response]))
        );
        setSavedIds(new Set(existing.map((r) => r.reflectionId)));
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const handleChange = (reflectionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [reflectionId]: value }));
    setSavedIds((prev) => {
      if (!prev.has(reflectionId)) return prev;
      const next = new Set(prev);
      next.delete(reflectionId);
      return next;
    });
  };

  const handleSave = useCallback(
    async (reflectionId: number) => {
      const text = (answers[reflectionId] ?? "").trim();
      if (!text || savingId !== null) return;
      setSavingId(reflectionId);
      try {
        await reflectionService.submitReflectionResponse(moduleId, reflectionId, text);
        setSavedIds((prev) => new Set(prev).add(reflectionId));
      } catch {
        /* leave unsaved — the "Save" button just stays active for retry */
      } finally {
        setSavingId(null);
      }
    },
    [answers, moduleId, savingId]
  );

  const allSaved = prompts.length > 0 && prompts.every((p) => savedIds.has(p.id));

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div className="flex flex-col items-center gap-3">
          <div style={{ width: "40px", height: "40px", border: "3px solid #e8e8e8", borderTopColor: "#006400", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "14px", color: "#888888" }}>Loading reflection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div className="text-center">
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>
            Failed to load reflection
          </p>
          <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, backgroundColor: "#fafafa" }}>
      {/* Breadcrumb bar */}
      <div
        style={{
          padding: isMobile ? "12px 16px" : "14px 24px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflow: "hidden" }}>
          <span style={{ color: "#888888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{courseName}</span>
          <ChevronSep size={14} style={{ color: "#d1d1d1", flexShrink: 0 }} />
          <span style={{ color: "#888888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trackName}</span>
          <ChevronSep size={14} style={{ color: "#d1d1d1", flexShrink: 0 }} />
          <span style={{ fontWeight: 600, color: "#101b37", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{moduleTitle}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "32px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ fontSize: "13px", color: "#888888", marginBottom: "8px" }}>Before the quiz</p>
          <h1 style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: 800, color: "#101b37", fontFamily: "var(--font-headline)", marginBottom: "8px", lineHeight: 1.2 }}>
            Reflect on this module
          </h1>
          <p style={{ fontSize: "15px", color: "#888888", lineHeight: 1.5, marginBottom: "28px" }}>
            Take a moment to think through what you've learned before moving on.
          </p>

          {prompts.map((prompt, index) => {
            const isSaved = savedIds.has(prompt.id);
            const isSaving = savingId === prompt.id;
            const text = answers[prompt.id] ?? "";
            return (
              <div
                key={prompt.id}
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e8e8e8",
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#006400", marginBottom: "8px" }}>
                  Prompt {index + 1} of {prompts.length}
                </p>
                <p style={{ fontSize: "15px", color: "#101b37", lineHeight: 1.5, marginBottom: prompt.criteria ? "12px" : "16px" }}>
                  {prompt.description}
                </p>
                {prompt.criteria && (
                  <p style={{ fontSize: "13px", color: "#888888", lineHeight: 1.6, marginBottom: "16px", fontStyle: "italic" }}>
                    {prompt.criteria}
                  </p>
                )}
                <textarea
                  value={text}
                  onChange={(e) => handleChange(prompt.id, e.target.value)}
                  placeholder="Write your response..."
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: "#101b37",
                    border: `1px solid ${isSaved ? "#c9e6c9" : "#e0e0e0"}`,
                    borderRadius: "8px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    backgroundColor: isSaved ? "#f8fdf8" : "#ffffff",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  {isSaved && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#006400", fontWeight: 600 }}>
                      <Check size={13} /> Saved
                    </span>
                  )}
                  <Button
                    variant={isSaved ? "outlined" : "primary"}
                    size="sm"
                    onClick={() => handleSave(prompt.id)}
                    disabled={!text.trim() || isSaving}
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ padding: isMobile ? "12px 16px" : "16px 32px", borderTop: "1px solid #e0e0e0", backgroundColor: "#ffffff", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "800px", margin: "0 auto" }}>
          <Button variant="outlined" size="sm" onClick={onBack}>
            <ChevronLeft size={14} />
            {!isMobile && "Back"}
          </Button>
          <Button variant="primary" size="sm" onClick={onContinue} disabled={!allSaved}>
            {isMobile ? "Quiz" : "Practice Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
                   }
