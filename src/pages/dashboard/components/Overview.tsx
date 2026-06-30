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
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa", minHeight: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px",
            border: "3px solid #e8e8e8", borderTopColor: "#006400",
            borderRadius: "50%", animation: "spin 1s linear infinite",
          }} />
          <p style={{ fontSize: "14px", color: "#888888" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa", minHeight: 0 }}>
        <div style={{ textAlign: "center" }}>
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
    // Single scroll container — header + content scroll together so the
    // page always starts at the top and scrolls naturally to the bottom.
    <div style={{
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      minHeight: 0,
      backgroundColor: "#fafafa",
      scrollBehavior: "smooth",
    }}>
      {/* Header — scrolls with the page, not fixed above scroll area */}
      <div style={{
        padding: "24px 20px 20px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#ffffff",
      }}>
        <h1 style={{
          fontSize: "clamp(22px, 5vw, 28px)",
          fontWeight: 800,
          color: "#101b37",
          fontFamily: "var(--font-headline)",
          letterSpacing: "-0.02em",
          marginBottom: "6px",
        }}>
          Welcome back!
        </h1>
        <p style={{ fontSize: "14px", color: "#888888", lineHeight: 1.5 }}>
          Continue your leadership development journey with SLAN Online.
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Stats Grid — 2 columns on mobile, 4 on desktop */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}>
          {/* Total Tracks */}
          <StatCard
            label="Total Tracks"
            value={stats.totalTracks}
            sub={`${stats.completedTracks} completed`}
            icon={<BookOpen size={18} style={{ color: "#10b981" }} />}
          />

          {/* Total Units */}
          <StatCard
            label="Total Units"
            value={stats.totalUnits}
            sub="Across all tracks"
            icon={<TrendingUp size={18} style={{ color: "#3b82f6" }} />}
          />

          {/* Total Hours */}
          <StatCard
            label="Total Hours"
            value={`${stats.totalHours}h`}
            sub="To complete all tracks"
            icon={<Clock size={18} style={{ color: "#8b5cf6" }} />}
          />

          {/* Overall Progress */}
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e8e8e8",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>Progress</span>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "24px", width: "24px", borderRadius: "50%",
                backgroundColor: stats.overallProgress > 0 ? "rgba(16,185,129,0.1)" : "#f5f5f5",
                fontSize: "10px", fontWeight: 700,
                color: stats.overallProgress > 0 ? "#10b981" : "#888888",
              }}>
                {stats.overallProgress}%
              </div>
            </div>
            <Progress value={stats.overallProgress} color="#10b981" />
            <p style={{ fontSize: "11px", color: "#888888", marginTop: "8px" }}>
              {stats.overallProgress > 0 ? "Keep going!" : "Start a track to begin"}
            </p>
          </div>
        </div>

        {/* Explore CTA */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e8e8e8",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}>
          <div>
            <h3 style={{
              fontSize: "15px", fontWeight: 700, color: "#101b37",
              fontFamily: "var(--font-headline)", marginBottom: "4px",
            }}>
              Explore All Tracks
            </h3>
            <p style={{ fontSize: "13px", color: "#888888" }}>
              Browse all available tracks and start learning
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => onExploreClick?.()}>
            <BookOpen size={16} />
            Explore
          </Button>
        </div>

        {/* Bottom padding so last card isn't flush against edge on mobile */}
        <div style={{ height: "32px" }} />
      </div>
    </div>
  );
}

// Extracted card to reduce repetition
function StatCard({
  label, value, sub, icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e8e8e8",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>{label}</span>
        {icon}
      </div>
      <p style={{ fontSize: "28px", fontWeight: 800, color: "#101b37", marginBottom: "2px" }}>
        {value}
      </p>
      <p style={{ fontSize: "11px", color: "#888888" }}>{sub}</p>
    </div>
  );
}