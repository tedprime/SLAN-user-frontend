import { useState, useEffect, useMemo } from "react";
import { BookOpen, TrendingUp, Clock, ArrowRight } from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import { courseService } from "../../../services/courseService";
import type { Course, CourseTrack } from "../../../services/types/course.types";


interface TrackWithProgress extends CourseTrack {
  courseId: number;
  courseTitle: string;
  progress: number;
  totalModules: number;
  totalUnits: number;
  estimatedHours: number;
}

export default function Overview({ onTrackClick }: { onTrackClick?: (trackId: number, courseId: number) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

 useEffect(() => {
  let cancelled = false;
  (async () => {
    setLoading(true);
    setError(false);
    try {
      const coursesData = await courseService.getCourses();
      if (!cancelled) {
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      }
    } catch {
      if (!cancelled) setError(true);
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, []);

  // Flatten all tracks from all courses with metadata
  const allTracks = useMemo<TrackWithProgress[]>(() => {
    const tracks: TrackWithProgress[] = [];
    
    // Guard: ensure courses is an array
    if (!Array.isArray(courses)) return tracks;
    
    courses.forEach((course) => {
      // Guard: ensure course.tracks is an array
      if (!Array.isArray(course?.tracks)) return;
      
      course.tracks.forEach((track) => {
        const totalModules = track?.moduleCount ?? 0;
        const totalUnits = track?.unitCount ?? 0;

        tracks.push({
          ...track,
          courseId: course.id,
          courseTitle: course.title || "Untitled Course",
          progress: track?.progressPercent ?? 0,
          totalModules,
          totalUnits,
          estimatedHours: Math.round((track?.totalEstimatedMinutes ?? 0) / 60) || 12,
        });
      });
    });
    return tracks;
  }, [courses]);

  // Stats
  const stats = useMemo(() => {
    const totalTracks = allTracks.length;
    const completedTracks = allTracks.filter((t) => t.progress === 100).length;
    const totalUnits = allTracks.reduce((acc, t) => acc + (t.totalUnits || 0), 0);
    const totalHours = allTracks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const overallProgress = totalTracks > 0 
      ? Math.round(allTracks.reduce((acc, t) => acc + (t.progress || 0), 0) / totalTracks)
      : 0;

    return { totalTracks, completedTracks, totalUnits, totalHours, overallProgress };
  }, [allTracks]);

  // In-progress tracks (or first 3 tracks if none in progress)
  const continueLearning = useMemo(() => {
    const inProgress = allTracks
      .filter((t) => (t.progress || 0) > 0 && (t.progress || 0) < 100)
      .sort((a, b) => (b.progress || 0) - (a.progress || 0));
    
    return inProgress.length > 0 ? inProgress.slice(0, 3) : allTracks.slice(0, 3);
  }, [allTracks]);

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div className="flex flex-col items-center gap-3">
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e8e8e8",
            borderTopColor: "#006400",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ fontSize: "14px", color: "#888888" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div className="text-center">
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>
            Failed to load dashboard
          </p>
          <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#fafafa" }}>
      {/* Header */}
      <div style={{ padding: "32px 32px 24px 32px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#101b37",
            fontFamily: "var(--font-headline)",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          Welcome back!
        </h1>
        <p style={{ fontSize: "15px", color: "#888888", lineHeight: 1.5 }}>
          Continue your leadership development journey with SLAN Online.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "32px" }}>
        <div style={{ maxWidth: "1200px" }}>
          {/* Stats Grid */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", marginBottom: "32px" }}
          >
            {/* Total Tracks */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#888888" }}>
                  Total Tracks
                </span>
                <BookOpen size={20} style={{ color: "#10b981" }} />
              </div>
              <p style={{ fontSize: "32px", fontWeight: 800, color: "#101b37", marginBottom: "4px" }}>
                {stats.totalTracks}
              </p>
              <p style={{ fontSize: "12px", color: "#888888" }}>
                {stats.completedTracks} completed
              </p>
            </div>

            {/* Total Units */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#888888" }}>
                  Total Units
                </span>
                <TrendingUp size={20} style={{ color: "#3b82f6" }} />
              </div>
              <p style={{ fontSize: "32px", fontWeight: 800, color: "#101b37", marginBottom: "4px" }}>
                {stats.totalUnits}
              </p>
              <p style={{ fontSize: "12px", color: "#888888" }}>
                Across all tracks
              </p>
            </div>

            {/* Total Hours */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#888888" }}>
                  Total Hours
                </span>
                <Clock size={20} style={{ color: "#8b5cf6" }} />
              </div>
              <p style={{ fontSize: "32px", fontWeight: 800, color: "#101b37", marginBottom: "4px" }}>
                {stats.totalHours}h
              </p>
              <p style={{ fontSize: "12px", color: "#888888" }}>
                To complete all tracks
              </p>
            </div>

            {/* Overall Progress */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#888888" }}>
                  Overall Progress
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "28px",
                    width: "28px",
                    borderRadius: "50%",
                    backgroundColor: stats.overallProgress > 0 ? "rgba(16, 185, 129, 0.1)" : "#f5f5f5",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: stats.overallProgress > 0 ? "#10b981" : "#888888",
                  }}
                >
                  {stats.overallProgress}%
                </div>
              </div>
              <Progress value={stats.overallProgress} color="#10b981" />
              <p style={{ fontSize: "12px", color: "#888888", marginTop: "12px" }}>
                {stats.overallProgress > 0 ? "Keep going!" : "Start a track to begin"}
              </p>
            </div>
          </div>

          {/* Continue Learning Section */}
          {continueLearning.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#101b37",
                  fontFamily: "var(--font-headline)",
                  marginBottom: "16px",
                  letterSpacing: "-0.01em",
                }}
              >
                {continueLearning.some((t) => (t.progress || 0) > 0) ? "Continue Learning" : "Get Started"}
              </h2>
              <div className="space-y-3">
                {continueLearning.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => onTrackClick?.(track.id, track.courseId)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8e8e8",
                      borderLeftWidth: "4px",
                      borderLeftColor: getTrackColor(index),
                      borderRadius: "12px",
                      padding: "20px 24px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "all 0.2s ease",
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2" style={{ marginBottom: "4px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#888888",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {track.courseTitle}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#101b37",
                            fontFamily: "var(--font-headline)",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          {track.title}
                        </h3>
                        <p style={{ fontSize: "13px", color: "#888888" }}>
                          {track.totalModules} modules · {track.totalUnits} units · {track.estimatedHours}h
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {(track.progress || 0) > 0 && (
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#101b37" }}>
                            {track.progress}%
                          </span>
                        )}
                        <ArrowRight size={18} style={{ color: "#888888" }} />
                      </div>
                    </div>
                    {(track.progress || 0) > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <Progress value={track.progress} color={getTrackColor(index)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explore All Tracks CTA */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#101b37",
                  fontFamily: "var(--font-headline)",
                  marginBottom: "4px",
                }}
              >
                Explore All Tracks
              </h3>
              <p style={{ fontSize: "13px", color: "#888888" }}>
                Browse all available tracks and start your learning journey
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                // Navigate to first course or all courses view
                if (courses.length > 0) {
                  console.log("Explore all tracks");
                }
              }}
            >
              <BookOpen size={16} />
              Explore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function getTrackColor(index: number): string {
  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#f43f5e", "#06b6d4", "#6366f1"];
  return colors[index % colors.length];
}