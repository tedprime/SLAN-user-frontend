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

interface TrackDetailViewProps {
  course: Course;
  track: CourseTrack;
  onBack?: () => void;
  onModuleClick?: (module: ModuleSummary) => void;
  onPlayClick?: (module: ModuleSummary) => void;
  onModulesLoaded?: (modules: ModuleSummary[]) => void;
}

export default function TrackDetailView({ course, track, onBack, onModuleClick, onPlayClick, onModulesLoaded }: TrackDetailViewProps) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Real progress from the API — track-level summary, plus per-module progress.
  const [trackProgress, setTrackProgress] = useState<TrackProgress | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<number, ModuleProgress>>({});

  // Use a ref for the callback so we don't need it in the dependency array (avoids
  // infinite re-fetch loops when the parent passes an inline arrow function).
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

        // Fetch track progress and per-module progress in parallel.
        // Unwrap envelopes — the API may return { success, data: T } or flat T.
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

  // Prefer the live track-progress fetch; fall back to the value already on
  // the track object (e.g. from GET /courses) if that call hasn't resolved yet.
  const displayedTrackProgress = trackProgress?.progressPercent ?? track.progressPercent ?? 0;

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      overflow: "hidden", backgroundColor: "#fafafa", minHeight: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ padding: "16px 32px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
        <div className="flex items-center gap-2" style={{ fontSize: "14px" }}>
          <button
            onClick={onBack}
            style={{ color: "#888888", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
          >
            {course.title}
          </button>
          <ChevronRight size={16} style={{ color: "#b0b0b0" }} />
          <span style={{ color: "#101b37", fontWeight: 600 }}>
            {track.title}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        borderBottom: "1px solid #e0e0e0",
        background: `linear-gradient(135deg, ${trackColor.bg} 0%, rgba(255,255,255,0.5) 100%)`,
        padding: "32px",
        flexShrink: 0,
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
            marginBottom: "12px", lineHeight: 1.2,
          }}>
            {track.title}
          </h1>

          <p style={{ fontSize: "15px", color: "#666666", marginBottom: "20px", maxWidth: "640px", lineHeight: 1.6 }}>
            {track.description || "Master the skills in this track through structured modules and interactive units."}
          </p>

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

      {/* Modules Section */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "32px", minHeight: 0 }}>
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

                return (
                  <div
                    key={module.id}
                    onClick={() => onModuleClick?.(module)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: "#ffffff", border: "1px solid #e8e8e8",
                      borderRadius: "12px", padding: "24px",
                      transition: "all 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            height: "28px", width: "28px", borderRadius: "50%",
                            backgroundColor: isCompleted ? trackColor.border : "#f5f5f5",
                            color: isCompleted ? "#ffffff" : "#888888",
                            fontSize: "12px", fontWeight: 700,
                          }}>
                            {isCompleted ? <CheckCircle size={14} /> : index + 1}
                          </span>
                          <h3 style={{
                            fontSize: "16px", fontWeight: 700, color: "#101b37",
                            fontFamily: "var(--font-headline)",
                          }}>
                            {module.title}
                          </h3>
                        </div>

                        <p style={{ fontSize: "14px", color: "#888888", marginBottom: "12px", lineHeight: 1.5 }}>
                          {module.description || "Explore this module to continue your learning journey."}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#b0b0b0" }}>
                            {module.unitCount} {module.unitCount === 1 ? "Unit" : "Units"}
                          </span>
                          {module.estimatedReadMinutes > 0 && (
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#b0b0b0" }}>
                              {module.estimatedReadMinutes} min read
                            </span>
                          )}
                        </div>

                        <div style={{ maxWidth: "400px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>Progress</span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#101b37" }}>{progress}%</span>
                          </div>
                          <Progress value={progress} color={trackColor.border} />
                        </div>
                      </div>

                      <div style={{ marginLeft: "16px", flexShrink: 0 }}>
                        <Button
                          variant={isCompleted ? "outlined" : "primary"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayClick?.(module);
                          }}
                        >
                          {isCompleted ? (
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