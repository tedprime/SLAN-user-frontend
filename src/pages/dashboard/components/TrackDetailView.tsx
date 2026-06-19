import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Lock, Play, BookOpen, Clock, Layers } from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import { courseService } from "../../../services/courseService";
import type { Course, CourseTrack, ModuleSummary } from "../../../services/types/course.types";

interface TrackDetailViewProps {
  course: Course;
  track: CourseTrack;
  onBack?: () => void;
  onModuleClick?: (moduleId: number) => void;
}

export default function TrackDetailView({ course, track, onBack, onModuleClick }: TrackDetailViewProps) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);


  const trackColor = getTrackColor(track.id);
  const trackIndex = getTrackIndex(course, track);

  useEffect(() => {
  let cancelled = false;
  (async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await courseService.getTrackModules(track.id);
      if (!cancelled) setModules(res.modules ?? []);
    } catch {
      if (!cancelled) setError(true);
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, [track.id, retryCount]); 

  const totalUnits = useMemo(() => {
    return modules.reduce((acc, m) => acc + (m.unitCount || 0), 0);
  }, [modules]);

  const estimatedHours = useMemo(() => {
    const totalMinutes = modules.reduce((acc, m) => acc + (m.totalEstimatedMinutes || 0), 0);
    return totalMinutes > 0 ? Math.round(totalMinutes / 60) : 0;
  }, [modules]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#fafafa" }}>
      {/* ── Breadcrumb ── */}
      <div
        style={{
          padding: "16px 32px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="flex items-center gap-2" style={{ fontSize: "14px" }}>
          <button
            onClick={onBack}
            className="transition-colors duration-150"
            style={{
              color: "#888888",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#006400";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#888888";
            }}
          >
            {course.title}
          </button>
          <ChevronRight size={16} style={{ color: "#b0b0b0" }} />
          <span style={{ color: "#101b37", fontWeight: 600 }}>
            {track.title}
          </span>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <div
        style={{
          borderBottom: "1px solid #e0e0e0",
          background: `linear-gradient(135deg, ${trackColor.bg} 0%, rgba(255,255,255,0.5) 100%)`,
          padding: "32px",
        }}
      >
        <div style={{ maxWidth: "800px" }}>
          {/* Track Number */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              width: "36px",
              borderRadius: "50%",
              backgroundColor: trackColor.border,
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 800,
              marginBottom: "16px",
            }}
          >
            {trackIndex + 1}
          </span>

          {/* Title */}
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#101b37",
              fontFamily: "var(--font-headline)",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
              lineHeight: 1.2,
              textTransform: "uppercase",
            }}
          >
            {track.title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "15px",
              color: "#666666",
              marginBottom: "20px",
              maxWidth: "640px",
              lineHeight: 1.6,
            }}
          >
            {track.description || "Master the skills in this track through structured modules and interactive units."}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-6" style={{ fontSize: "14px", color: "#888888" }}>
            <span className="flex items-center gap-2">
              <Layers size={16} style={{ color: trackColor.border }} />
              <span style={{ fontWeight: 600 }}>{modules.length || track.moduleCount} Modules</span>
            </span>
            <span className="flex items-center gap-2">
              <BookOpen size={16} style={{ color: trackColor.border }} />
              <span style={{ fontWeight: 600 }}>{totalUnits || track.unitCount} Units</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} style={{ color: trackColor.border }} />
              <span style={{ fontWeight: 600 }}>
                {estimatedHours || Math.round((track.totalEstimatedMinutes || 0) / 60) || 0} hours
              </span>
            </span>
            {!track.isFree && (
              <span
                className="flex items-center gap-1.5"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#d4af37",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <Lock size={14} />
                Premium
              </span>
            )}
          </div>

          {track.progressPercent > 0 && (
            <div style={{ marginTop: "20px", maxWidth: "400px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>
                  Track Progress
                </span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#101b37" }}>
                  {track.progressPercent}%
                </span>
              </div>
              <Progress value={track.progressPercent} color={trackColor.border} />
            </div>
          )}
        </div>
      </div>

      {/* ── Modules Section ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "32px" }}>
        <div style={{ maxWidth: "800px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#101b37",
              fontFamily: "var(--font-headline)",
              marginBottom: "24px",
              letterSpacing: "-0.01em",
            }}
          >
            Modules
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: "48px 0" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid #e8e8e8",
                  borderTopColor: trackColor.border,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : error ? (
            <div
              className="flex flex-col items-center justify-center"
              style={{ padding: "48px 0", textAlign: "center" }}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>
                Couldn't load modules
              </p>
              <Button variant="outlined" size="sm" onClick={() => setRetryCount(c => c + 1)}>
                Retry
              </Button>
            </div>
          ) : modules.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center"
              style={{ padding: "48px 0", textAlign: "center" }}
            >
              <Layers size={48} style={{ color: "#d1d1d1", marginBottom: "16px" }} />
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#888888" }}>
                No modules available yet
              </p>
              <p style={{ fontSize: "13px", color: "#b0b0b0", marginTop: "4px" }}>
                Check back later for new content
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module: ModuleSummary, index: number) => {
                return (
                  <div
                    key={module.id}
                    onClick={() => onModuleClick?.(module.id)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8e8e8",
                      borderRadius: "12px",
                      padding: "24px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Module Number + Title */}
                        <div className="flex items-center gap-3" style={{ marginBottom: "8px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "28px",
                              width: "28px",
                              borderRadius: "50%",
                              backgroundColor: "#f5f5f5",
                              color: "#888888",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            {index + 1}
                          </span>
                          <h3
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#101b37",
                              fontFamily: "var(--font-headline)",
                            }}
                          >
                            {module.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#888888",
                            marginBottom: "8px",
                            lineHeight: 1.5,
                          }}
                        >
                          {module.description || "Explore this module to continue your learning journey."}
                        </p>

                        {/* Units count */}
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#b0b0b0" }}>
                          {module.unitCount} {module.unitCount === 1 ? "Unit" : "Units"}
                          {module.estimatedReadMinutes ? ` · ${module.estimatedReadMinutes} min` : ""}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div style={{ marginLeft: "16px", flexShrink: 0 }}>
                        <Button variant="primary" size="sm">
                          <Play size={14} />
                          Start
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

// ── Helpers ──────────────────────────────────────────────

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