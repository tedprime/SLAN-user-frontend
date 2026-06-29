import { useState, useEffect, useMemo } from "react";
import { BookOpen, TrendingUp, Clock } from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import { courseService } from "../../../services/courseService";
import type { Course } from "../../../services/types/course.types";


export default function Overview({ onExploreClick }: { onExploreClick?: () => void }) {
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

  // Stats
  const stats = useMemo(() => {
    if (!Array.isArray(courses)) return { totalTracks: 0, completedTracks: 0, totalUnits: 0, totalHours: 0, overallProgress: 0 };
    let totalTracks = 0, completedTracks = 0, totalUnits = 0, totalMinutes = 0, progressSum = 0;
    courses.forEach((course) => {
      if (!Array.isArray(course?.tracks)) return;
      course.tracks.forEach((track) => {
        totalTracks++;
        const p = track?.progressPercent ?? 0;
        if (p === 100) completedTracks++;
        totalUnits += track?.unitCount ?? 0;
        totalMinutes += track?.totalEstimatedMinutes ?? 0;
        progressSum += p;
      });
    });
    return {
      totalTracks,
      completedTracks,
      totalUnits,
      totalHours: Math.round(totalMinutes / 60),
      overallProgress: totalTracks > 0 ? Math.round(progressSum / totalTracks) : 0,
    };
  }, [courses]);

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ backgroundColor: "#fafafa", minHeight: 0, width: "100%" }}
      >
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
      <div
        className="flex-1 flex items-center justify-center"
        style={{ backgroundColor: "#fafafa", minHeight: 0, width: "100%" }}
      >
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#fafafa", minHeight: 0 }}>
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
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "32px", minHeight: 0, scrollBehavior: "smooth" }}>
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
              onClick={() => onExploreClick?.()}
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