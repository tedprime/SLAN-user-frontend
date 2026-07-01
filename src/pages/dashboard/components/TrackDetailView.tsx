import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronRight, Lock, Play, BookOpen, Clock, Layers, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import { courseService } from "../../../services/courseService";
import { progressService } from "../../../services/progressService";
import type { TrackProgress, ModuleProgress } from "../../../services/progressService";
import type { Course, CourseTrack, ModuleSummary } from "../../../services/types/course.types";

// Unwrap API envelope { success, data: T } defensively
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && typeof res === "object" && "data" in res) return res.data as T;
  return res as T;
}

const MOBILE_BP = 768;
const DESCRIPTION_WORD_LIMIT = 50;
const MODULE_ACCENT_COLOR = "rgb(0,100,0)";

interface ExpandableTextProps {
  text: string;
  wordLimit?: number;
  style?: React.CSSProperties;
  linkColor: string;
}

function ExpandableText({ text, wordLimit = DESCRIPTION_WORD_LIMIT, style, linkColor }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const words = text.trim().split(/\s+/);
  const canTruncate = words.length > wordLimit;
  const displayText = !canTruncate || expanded
    ? text
    : words.slice(0, wordLimit).join(" ") + "…";

  return (
    <p style={style}>
      {displayText}
      {canTruncate && (
        <>
          {" "}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            style={{
              display: "inline",
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              cursor: "pointer",
              fontSize: "inherit",
              fontWeight: 500,
              color: linkColor,
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </>
      )}
    </p>
  );
}

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

interface TrackDetailViewProps {
  course: Course;
  track: CourseTrack;
  onBack?: () => void;
  onModuleClick?: (module: ModuleSummary) => void;
  onPlayClick?: (module: ModuleSummary) => void;
  onModulesLoaded?: (modules: ModuleSummary[]) => void;
}

export default function TrackDetailView({ course, track, onBack, onModuleClick, onPlayClick, onModulesLoaded }: TrackDetailViewProps) {
  const isMobile = useIsMobile();
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [trackProgress, setTrackProgress] = useState<TrackProgress | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<number, ModuleProgress>>({});

  const onModulesLoadedRef = useRef(onModulesLoaded);
  useEffect(() => { onModulesLoadedRef.current = onModulesLoaded; }, [onModulesLoaded]);

  const trackColor = getTrackColor(track.id);
  const trackIndex = getTrackIndex(course, track);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      setModuleProgress({});
      setTrackProgress(null);
      try {
        const res = await courseService.getTrackModules(track.id);
        const moduleList = Array.isArray(res?.modules) ? res.modules : [];
        if (cancelled) return;
        setModules(moduleList);
        onModulesLoadedRef.current?.(moduleList);

        const [trackProgressRaw, moduleProgressRaws] = await Promise.all([
          progressService.getTrackProgress(track.id).catch(() => null),
          Promise.all(
            moduleList.map((m) => progressService.getModuleProgress(m.id).catch(() => null))
          ),
        ]);

        if (cancelled) return;

        if (trackProgressRaw) {
          const tp = unwrap<TrackProgress>(trackProgressRaw);
          setTrackProgress(tp);
        }

        const progressMap: Record<number, ModuleProgress> = {};
        moduleList.forEach((m, i) => {
          const raw = moduleProgressRaws[i];
          if (raw) progressMap[m.id] = unwrap<ModuleProgress>(raw);
        });
        setModuleProgress(progressMap);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [track.id, retryCount]);

  const totalUnits = useMemo(() => modules.reduce((acc, m) => acc + (m.unitCount || 0), 0), [modules]);

  const estimatedHours = useMemo(() => {
    const totalMinutes = modules.reduce((acc, m) => acc + (m.totalEstimatedMinutes || 0), 0);
    return totalMinutes > 0 ? Math.round(totalMinutes / 60) : 0;
  }, [modules]);

  const getModuleProgress = (module: ModuleSummary): number => {
    return moduleProgress[module.id]?.progressPercent ?? 0;
  };

  const isModuleCompleted = (module: ModuleSummary): boolean => {
    return moduleProgress[module.id]?.isCompleted ?? false;
  };

  // A module is locked unless it's the first module in the track, or the
  // module directly before it has been fully completed (progress = 100%).
  const isModuleLocked = (index: number): boolean => {
    if (index === 0) return false;
    const previousModule = modules[index - 1];
    return previousModule ? !isModuleCompleted(previousModule) : false;
  };

  const displayedTrackProgress = trackProgress?.progressPercent ?? track.progressPercent ?? 0;

  return (
    // Single scroll container — breadcrumb, hero, and modules all scroll
    // together so the page always starts at the top, matching the pattern
    // used in Overview.tsx / CourseTracksView.tsx.
    <div style={{
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      minHeight: 0,
      backgroundColor: "#fafafa",
      scrollBehavior: "smooth",
      WebkitOverflowScrolling: "touch",
      overscrollBehavior: "contain",
    }}>
      {/* Breadcrumb */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
        <div className="flex items-center gap-2" style={{ fontSize: "14px" }}>
          <button
            onClick={onBack}
            style={{ color: "#888888", background: "none", border: "none", cursor: "pointer", fontSize: "14px", textTransform: "uppercase" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
          >
            {course.title}
          </button>
          <ChevronRight size={16} style={{ color: "#b0b0b0" }} />
          <span style={{ color: "#101b37", fontWeight: 600, textTransform: "uppercase" }}>
            {track.title}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        borderBottom: "1px solid #e0e0e0",
        background: `linear-gradient(135deg, ${trackColor.bg} 0%, rgba(255,255,255,0.5) 100%)`,
        padding: "24px 20px",
      }}>
        <div style={{ maxWidth: "1200px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            height: "36px", width: "36px", borderRadius: "50%",
            backgroundColor: trackColor.border, color: "#ffffff",
            fontSize: "14px", fontWeight: 800, marginBottom: "16px",
          }}>
            {trackIndex + 1}
          </span>

          <h1 style={{
            fontSize: "28px", fontWeight: 800, color: "#101b37",
            fontFamily: "var(--font-headline)", letterSpacing: "-0.02em",
            marginBottom: "12px", lineHeight: 1.2, textTransform: "uppercase",
          }}>
            {track.title}
          </h1>

          <ExpandableText
            text={track.description || "Master the skills in this track through structured modules and interactive units."}
            linkColor={trackColor.border}
            style={{ fontSize: "15px", color: "#666666", marginBottom: "20px", maxWidth: "640px", lineHeight: 1.6 }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "14px", color: "#888888", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={16} style={{ color: trackColor.border }} />
              <span style={{ fontWeight: 600 }}>{modules.length || track.moduleCount} Modules</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={16} style={{ color: trackColor.border }} />
              <span style={{ fontWeight: 600 }}>{totalUnits || track.unitCount} Units</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} style={{ color: trackColor.border }} />
              <span style={{ fontWeight: 600 }}>
                {estimatedHours || Math.round((track.totalEstimatedMinutes || 0) / 60) || 0} hours
              </span>
            </span>
            {!track.isFree && (
              <span className="flex items-center gap-1.5" style={{
                fontSize: "12px", fontWeight: 700, color: "#d4af37",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                <Lock size={14} />
                Premium
              </span>
            )}
          </div>

          {displayedTrackProgress > 0 && (
            <div style={{ marginTop: "20px", maxWidth: "400px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>Track Progress</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#101b37" }}>{displayedTrackProgress}%</span>
              </div>
              <Progress value={displayedTrackProgress} color={trackColor.border} />
            </div>
          )}
        </div>
      </div>

      {/* Modules Section — regular content now, not its own scroll region */}
      <div style={{ padding: "32px" }}>
        <div style={{ maxWidth: "1200px" }}>
          <h2 style={{
            fontSize: "20px", fontWeight: 800, color: "#101b37",
            fontFamily: "var(--font-headline)", marginBottom: "24px", letterSpacing: "-0.01em",
          }}>
            Modules
          </h2>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
              <div style={{
                width: "32px", height: "32px",
                border: "3px solid #e8e8e8", borderTopColor: trackColor.border,
                borderRadius: "50%", animation: "spin 1s linear infinite",
              }} />
            </div>
          ) : error ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center" }}>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>
                Couldn't load modules
              </p>
              <Button variant="outlined" size="sm" onClick={() => setRetryCount(c => c + 1)}>Retry</Button>
            </div>
          ) : modules.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center" }}>
              <Layers size={48} style={{ color: "#d1d1d1", marginBottom: "16px" }} />
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#888888" }}>No modules available yet</p>
              <p style={{ fontSize: "13px", color: "#b0b0b0", marginTop: "4px" }}>Check back later for new content</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {modules.map((module: ModuleSummary, index: number) => {
                const progress = getModuleProgress(module);
                const isCompleted = isModuleCompleted(module);
                const locked = isModuleLocked(index);

                return (
                  <div
                    key={module.id}
                    onClick={() => {
                      if (!locked) onModuleClick?.(module);
                    }}
                    className={locked ? "cursor-not-allowed" : "cursor-pointer"}
                    title={locked ? "Complete the previous module first" : undefined}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8e8e8",
                      borderRadius: "12px",
                      padding: isMobile ? "16px" : "24px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      width: "100%",
                      boxSizing: "border-box",
                      opacity: locked ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (locked) return;
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      if (locked) return;
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "stretch" : "flex-start",
                        justifyContent: "space-between",
                        gap: isMobile ? "16px" : "20px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          height: "28px", width: "28px", minWidth: "28px", borderRadius: "50%",
                          backgroundColor: isCompleted ? MODULE_ACCENT_COLOR : locked ? "#e8e8e8" : "#f5f5f5",
                          color: isCompleted ? "#ffffff" : locked ? "#aaaaaa" : "#888888",
                          fontSize: "12px", fontWeight: 700, flexShrink: 0,
                          marginTop: "1px",
                        }}>
                          {isCompleted ? (
                            <CheckCircle size={14} />
                          ) : locked ? (
                            <Lock size={12} />
                          ) : (
                            index + 1
                          )}
                        </span>

                        {/* Everything below shares this column, so it lines up under the title — not under the badge */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: locked ? "#b0b0b0" : MODULE_ACCENT_COLOR,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "4px",
                          }}>
                            Module {index + 1}
                          </span>

                          <h3 style={{
                            fontSize: "16px", fontWeight: 700,
                            color: locked ? "#aaaaaa" : "#101b37",
                            fontFamily: "var(--font-headline)",
                            lineHeight: 1.35,
                            marginBottom: "8px",
                          }}>
                            {module.title}
                          </h3>

                          <ExpandableText
                            text={module.description || "Explore this module to continue your learning journey."}
                            linkColor={locked ? "#b0b0b0" : MODULE_ACCENT_COLOR}
                            style={{
                              fontSize: "14px",
                              color: locked ? "#b0b0b0" : "#888888",
                              marginBottom: "12px",
                              lineHeight: 1.5,
                            }}
                          />

                          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px", flexWrap: "wrap", rowGap: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#b0b0b0" }}>
                              {module.unitCount} {module.unitCount === 1 ? "Unit" : "Units"}
                            </span>
                            {module.estimatedReadMinutes > 0 && (
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "#b0b0b0" }}>
                                {module.estimatedReadMinutes} min read
                              </span>
                            )}
                            {locked && (
                              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: "#b0b0b0" }}>
                                <Lock size={11} />
                                Locked
                              </span>
                            )}
                          </div>

                          {!locked && (
                            <div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>Progress</span>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#101b37" }}>{progress}%</span>
                              </div>
                              <Progress value={progress} color={MODULE_ACCENT_COLOR} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ flexShrink: 0, display: "flex", width: isMobile ? "100%" : "auto" }}>
                        <Button
                          variant={isCompleted ? "outlined" : "primary"}
                          size="sm"
                          disabled={locked}
                          style={
                            isCompleted
                              ? { color: MODULE_ACCENT_COLOR, borderColor: MODULE_ACCENT_COLOR }
                              : { backgroundColor: MODULE_ACCENT_COLOR, borderColor: MODULE_ACCENT_COLOR }
                          }
                          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                            if (locked) return;
                            const btn = e.currentTarget;
                            if (isCompleted) {
                              btn.style.backgroundColor = MODULE_ACCENT_COLOR;
                              btn.style.color = "#ffffff";
                            } else {
                              btn.style.filter = "brightness(1.1)";
                            }
                          }}
                          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                            if (locked) return;
                            const btn = e.currentTarget;
                            if (isCompleted) {
                              btn.style.backgroundColor = "transparent";
                              btn.style.color = MODULE_ACCENT_COLOR;
                            } else {
                              btn.style.filter = "brightness(1)";
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!locked) onPlayClick?.(module);
                          }}
                        >
                          {locked ? (
                            <><Lock size={14} />Locked</>
                          ) : isCompleted ? (
                            <><CheckCircle size={14} />Completed</>
                          ) : (
                            <><Play size={14} />{progress > 0 ? "Continue" : "Start"}</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom padding so last module card isn't flush against edge on mobile */}
        <div style={{ height: "32px" }} />
      </div>
    </div>
  );
}

function getTrackColor(trackId: number): { border: string; bg: string } {
  const colors = [
    { border: "#10b981", bg: "rgba(16, 185, 129, 0.08)" },
    { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)" },
    { border: "#8b5cf6", bg: "rgba(139, 92, 246, 0.08)" },
    { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)" },
    { border: "#f43f5e", bg: "rgba(244, 63, 94, 0.08)" },
    { border: "#06b6d4", bg: "rgba(6, 182, 212, 0.08)" },
    { border: "#6366f1", bg: "rgba(99, 102, 241, 0.08)" },
  ];
  return colors[trackId % colors.length];
}

function getTrackIndex(course: Course, track: CourseTrack): number {
  return course.tracks.findIndex((t) => t.id === track.id);
}