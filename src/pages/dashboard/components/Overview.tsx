import { useState, useEffect, useMemo } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import { courseService } from "../../../services/courseService";
import { getUser } from "../../../services/tokenService";
import type { Course, CourseTrack } from "../../../services/types/course.types";

// Cycled per card so the "Available Courses" grid doesn't look flat —
// built from the app's own primary/tertiary palette (input.css @theme),
// not arbitrary colors.
const COURSE_GRADIENTS = [
  "linear-gradient(135deg, #101b37 0%, #006400 100%)",
  "linear-gradient(135deg, #1e2e55 0%, #1a7a1a 100%)",
  "linear-gradient(135deg, #090f1f 0%, #268d26 100%)",
];

interface OverviewProps {
  /** A course card (or the empty-state CTA) was clicked. */
  onCourseClick?: (courseId: number) => void;
  /** "Continue" was clicked on the resume banner. */
  onResumeClick?: (courseId: number, trackId: number) => void;
}

export default function Overview({ onCourseClick, onResumeClick }: OverviewProps) {
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

  const user = useMemo(() => getUser(), []);
  const firstName = user?.fullName?.split(" ")[0] || "Leader";
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const stats = useMemo(() => {
    if (!Array.isArray(courses)) return { totalTracks: 0, overallProgress: 0 };
    let totalTracks = 0, progressSum = 0;
    courses.forEach((course) => {
      if (!Array.isArray(course?.tracks)) return;
      course.tracks.forEach((track) => {
        totalTracks++;
        progressSum += track?.progressPercent ?? 0;
      });
    });
    return {
      totalTracks,
      overallProgress: totalTracks > 0 ? Math.round(progressSum / totalTracks) : 0,
    };
  }, [courses]);

  // First in-progress track across all courses — the "pick up where you
  // left off" prompt. Falls back to nothing if everything is either
  // untouched or already complete.
  const resumeTarget = useMemo(() => {
    const match = courses
      .flatMap((course) =>
        (Array.isArray(course?.tracks) ? course.tracks : []).map((track: CourseTrack) => ({ course, track }))
      )
      .find(({ track }) => (track?.progressPercent ?? 0) > 0 && (track?.progressPercent ?? 0) < 100);

    if (!match) return null;

    return {
      courseId: match.course.id,
      courseTitle: match.course.title,
      trackId: match.track.id,
      trackTitle: match.track.title,
      progress: match.track.progressPercent ?? 0,
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
    // Single scroll container — hero + content scroll together so the
    // page always starts at the top and scrolls naturally to the bottom.
    <div style={{
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      minHeight: 0,
      backgroundColor: "#fafafa",
      scrollBehavior: "smooth",
    }}>
      {/* Hero — dark navy → primary green gradient, matches the app's
         tertiary/primary theme tokens rather than a one-off color. */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #101b37 0%, #0d3d1a 55%, #006400 100%)",
          padding: "60px 20px 60px",
        }}
      >
        {/* Faint decorative rings, purely CSS — no external art needed */}
        <div aria-hidden style={{ position: "absolute", top: "-70px", right: "-50px", width: "260px", height: "260px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "-90px", right: "60px", width: "180px", height: "180px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", maxWidth: "1200px", margin: "0 auto" }}>
          <div>
            <h1
              style={{
                fontSize: "clamp(22px, 5vw, 30px)",
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: "var(--font-headline)",
                letterSpacing: "-0.02em",
                marginBottom: "6px",
              }}
            >
              {greeting}, {firstName}
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)", lineHeight: 1.5 }}>
              Continue building your leadership toolkit.
            </p>
          </div>

          {stats.totalTracks > 0 && (
            <div
              style={{
                width: "80px",
                height: "80px",
                minWidth: "80px",
                borderRadius: "50%",
                border: "3px solid #d4af37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-headline)" }}>
                {stats.overallProgress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content — sits entirely below the hero, no overlap */}
      <div style={{ padding: "24px 20px 0", maxWidth: "1200px", margin: "0 auto" }}>
        {resumeTarget && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e8e8",
              borderLeft: "4px solid #d4af37",
              borderRadius: "12px",
              padding: "18px 22px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#101b37",
                  fontFamily: "var(--font-headline)",
                  marginBottom: "4px",
                }}
              >
                Resume: {resumeTarget.trackTitle}
              </h3>
              <p style={{ fontSize: "13px", color: "#888888", fontFamily: "var(--font-body)" }}>
                {resumeTarget.courseTitle} • {resumeTarget.progress}% complete
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => onResumeClick?.(resumeTarget.courseId, resumeTarget.trackId)}
            >
              Continue <ArrowRight size={16} />
            </Button>
          </div>
        )}

        <h2
          style={{
            fontSize: "var( --text-display-xl)",
            fontWeight: 800,
            color: "#101b37",
            fontFamily: "var(--font-headline)",
            letterSpacing: "-0.01em",
            marginBottom: "4px",
          }}
        >
          Available Courses
        </h2>
        <p style={{ fontSize: "13px", color: "#888888", fontFamily: "var(--font-body)", marginBottom: "18px" }}>
          Explore our curated collection of leadership development programs.
        </p>

        {courses.length === 0 ? (
          <div style={{ minHeight: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", backgroundColor: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "12px" }}>
            <BookOpen size={40} style={{ color: "#d1d1d1", marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#888888" }}>No courses available yet</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                gradient={COURSE_GRADIENTS[index % COURSE_GRADIENTS.length]}
                onClick={() => onCourseClick?.(course.id)}
              />
            ))}
          </div>
        )}

        {/* Bottom padding so last card isn't flush against edge on mobile */}
        <div style={{ height: "32px" }} />
      </div>
    </div>
  );
}

function CourseCard({
  course,
  gradient,
  onClick,
}: {
  course: Course;
  gradient: string;
  onClick?: () => void;
}) {
  const tracks = Array.isArray(course.tracks) ? course.tracks : [];
  const trackCount = tracks.length;
  const totalUnits = tracks.reduce((sum, t) => sum + (t?.unitCount ?? 0), 0);
  const progress =
    trackCount > 0
      ? Math.round(tracks.reduce((sum, t) => sum + (t?.progressPercent ?? 0), 0) / trackCount)
      : 0;

  return (
    <div
      onClick={onClick}
      className="card-hover cursor-pointer"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: "110px",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BookOpen size={30} style={{ color: "rgba(255,255,255,0.85)" }} />
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "#101b37",
            fontFamily: "var(--font-headline)",
            letterSpacing: "-0.01em",
            marginBottom: "6px",
            lineHeight: 1.3,
          }}
        >
          {course.title}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "#888888",
            fontFamily: "var(--font-body)",
            lineHeight: 1.5,
            marginBottom: "14px",
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.shortDescription || course.description}
        </p>

        <p style={{ fontSize: "12px", color: "#b0b0b0", fontFamily: "var(--font-body)", marginBottom: "12px" }}>
          {trackCount} tracks • {totalUnits} units
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <Progress value={progress} color="#006400" />
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              color: progress > 0 ? "#10b981" : "#888888",
              backgroundColor: progress > 0 ? "rgba(16,185,129,0.1)" : "#f5f5f5",
              padding: "3px 9px",
              borderRadius: "9999px",
              whiteSpace: "nowrap",
            }}
          >
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}