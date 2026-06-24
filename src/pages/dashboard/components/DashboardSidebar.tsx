import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Lock,
} from "lucide-react";
import { authService } from "../../../services/authService";
import { courseService } from "../../../services/courseService";
import { getRefreshToken, clearTokens } from "../../../services/tokenService";
import type { Course } from "../../../services/types/course.types";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCoursesLoaded?: (courses: Course[]) => void; // <-- ADDED
}

export default function DashboardSidebar({
  activeNav,
  onNavChange,
  isOpen,
  onToggle,
  onCoursesLoaded, // <-- ADDED
}: DashboardSidebarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(false);
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setCoursesLoading(true);
      setCoursesError(false);
      try {
        const data = await courseService.getCourses();
        if (!cancelled) {
          setCourses(data);
          onCoursesLoaded?.(data); // <-- ADDED
        }
      } catch {
        if (!cancelled) setCoursesError(true);
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onCoursesLoaded]); // <-- ADDED to dependency array

  const toggleCourse = (courseId: number) => {
    setExpandedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const isOverviewActive = activeNav === "overview";
  const isAnyCourseActive =
    activeNav.startsWith("course:") || activeNav.startsWith("track:");

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        width: isOpen ? "288px" : "64px",
        borderRight: "1px solid #e0e0e0",
        height: "100vh",
        overflow: "hidden",
        transition: "width 0.25s ease",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
      }}
    >
      <div
        style={{
          height: "64px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          paddingLeft: isOpen ? "20px" : "0",
          paddingRight: isOpen ? "12px" : "0",
          flexShrink: 0,
        }}
      >
        {isOpen && (
          <span className="font-headline font-800 text-xl tracking-tight text-primary-500 whitespace-nowrap">
            SLAN <span className="text-tertiary-500">Online</span>
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            padding: "6px",
            borderRadius: "6px",
            transition: "background-color 0.2s",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "rgba(0,100,0,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent";
          }}
        >
          {isOpen ? (
            <X size={20} style={{ color: "#006400" }} />
          ) : (
            <Menu size={20} style={{ color: "#006400" }} />
          )}
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", paddingTop: "8px" }}>
        {/* ── Overview ───────────────────────────────────────── */}
        <button
          onClick={() => onNavChange("overview")}
          title={!isOpen ? "Overview" : undefined}
          className="w-full flex items-center text-left mb-1"
          style={{
            padding: "14px 0",
            fontSize: "15px",
            fontWeight: 600,
            textTransform: "capitalize",
            letterSpacing: "0.02em",
            transition: "all 0.15s",
            backgroundColor: isOverviewActive
              ? "rgba(0,100,0,0.07)"
              : "transparent",
            color: isOverviewActive ? "#006400" : "rgba(0,100,0,0.45)",
            paddingLeft: isOpen ? (isOverviewActive ? "21px" : "24px") : "0px",
            paddingRight: isOpen ? "24px" : "0px",
            justifyContent: isOpen ? "flex-start" : "center",
            gap: isOpen ? "12px" : "0px",
            whiteSpace: "nowrap",
            border: "none",
            cursor: "pointer",
            borderLeftWidth: "3px",
            borderLeftStyle: "solid",
            borderLeftColor: isOverviewActive ? "#101b37" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!isOverviewActive) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(0,100,0,0.04)";
              (e.currentTarget as HTMLButtonElement).style.color = "#006400";
            }
          }}
          onMouseLeave={(e) => {
            if (!isOverviewActive) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(0,100,0,0.45)";
            }
          }}
        >
          <span style={{ flexShrink: 0 }}>
            <LayoutDashboard size={20} />
          </span>
          {isOpen && <span>OVERVIEW</span>}
        </button>

        {/* ── Courses (collapsed sidebar: single static icon) ─── */}
        {!isOpen && (
          <button
            onClick={() => onNavChange("courses")}
            title="Courses"
            className="w-full flex items-center justify-center mb-1"
            style={{
              padding: "14px 0",
              transition: "all 0.15s",
              backgroundColor: isAnyCourseActive
                ? "rgba(0,100,0,0.07)"
                : "transparent",
              color: isAnyCourseActive ? "#006400" : "rgba(0,100,0,0.45)",
              border: "none",
              cursor: "pointer",
              borderLeftWidth: "3px",
              borderLeftStyle: "solid",
              borderLeftColor: isAnyCourseActive ? "#101b37" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isAnyCourseActive) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(0,100,0,0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = "#006400";
              }
            }}
            onMouseLeave={(e) => {
              if (!isAnyCourseActive) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(0,100,0,0.45)";
              }
            }}
          >
            <BookOpen size={20} />
          </button>
        )}

        {/* ── Courses (expanded sidebar: real data + dropdown) ── */}
        {isOpen && (
          <div style={{ marginBottom: "4px" }}>
            {coursesLoading && (
              <div
                style={{
                  padding: "14px 24px",
                  fontSize: "13px",
                  color: "#b0b0b0",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <BookOpen size={20} style={{ opacity: 0.5 }} />
                Loading courses…
              </div>
            )}

            {!coursesLoading && coursesError && (
              <div
                style={{
                  padding: "12px 24px",
                  fontSize: "12px",
                  color: "#d32f2f",
                  lineHeight: 1.4,
                }}
              >
                Couldn't load courses.{" "}
                <button
                  onClick={() => {
                    setCoursesLoading(true);
                    setCoursesError(false);
                    courseService
                      .getCourses()
                      .then((data) => {
                        setCourses(data);
                        onCoursesLoaded?.(data); // <-- ADDED
                      })
                      .catch(() => setCoursesError(true))
                      .finally(() => setCoursesLoading(false));
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#006400",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!coursesLoading && !coursesError && courses.length === 0 && (
              <div
                style={{
                  padding: "12px 24px",
                  fontSize: "12px",
                  color: "#b0b0b0",
                }}
              >
                No courses available yet.
              </div>
            )}

            {!coursesLoading &&
              !coursesError &&
              courses.map((course) => {
                const isExpanded = expandedCourseIds.has(course.id);
                const isCourseActive =
                  activeNav === `course:${course.id}` ||
                  activeNav.startsWith(`track:${course.id}:`);

                return (
                  <div key={course.id}>
                    <button
                      onClick={() => {
                        toggleCourse(course.id);
                      }}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center justify-between text-left mb-1"
                      style={{
                        padding: "14px 24px",
                        fontSize: "15px",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        transition: "all 0.15s",
                        backgroundColor: isCourseActive
                          ? "rgba(0,100,0,0.07)"
                          : "transparent",
                        color: isCourseActive
                          ? "#006400"
                          : "rgba(0,100,0,0.45)",
                        paddingLeft: isCourseActive ? "21px" : "24px",
                        whiteSpace: "nowrap",
                        border: "none",
                        cursor: "pointer",
                        borderLeftWidth: "3px",
                        borderLeftStyle: "solid",
                        borderLeftColor: isCourseActive
                          ? "#101b37"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isCourseActive) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = "rgba(0,100,0,0.04)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#006400";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCourseActive) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "rgba(0,100,0,0.45)";
                        }
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ flexShrink: 0 }}>
                          <BookOpen size={20} />
                        </span>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {course.title}
                        </span>
                      </span>
                      <span style={{ flexShrink: 0, color: "#b0b0b0" }}>
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                    </button>

                    {isExpanded && (
                      <div style={{ paddingBottom: "4px" }}>
                        {course.tracks.length === 0 && (
                          <div
                            style={{
                              padding: "8px 24px 8px 56px",
                              fontSize: "12px",
                              color: "#b0b0b0",
                            }}
                          >
                            No tracks yet.
                          </div>
                        )}
                        {course.tracks.map((track) => {
                          const isTrackActive =
                            activeNav === `track:${course.id}:${track.id}`;
                          return (
                            <button
                              key={track.id}
                              onClick={() =>
                                onNavChange(`track:${course.id}:${track.id}`)
                              }
                              title={track.title}
                              className="w-full flex items-center justify-between text-left"
                              style={{
                                padding: "9px 24px 9px 56px",
                                fontSize: "13px",
                                fontWeight: 500,
                                transition: "all 0.15s",
                                backgroundColor: isTrackActive
                                  ? "rgba(0,100,0,0.06)"
                                  : "transparent",
                                color: isTrackActive ? "#006400" : "#666666",
                                whiteSpace: "nowrap",
                                border: "none",
                                cursor: "pointer",
                                borderLeftWidth: "3px",
                                borderLeftStyle: "solid",
                                borderLeftColor: isTrackActive
                                  ? "#d4af37"
                                  : "transparent",
                              }}
                              onMouseEnter={(e) => {
                                if (!isTrackActive) {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.backgroundColor =
                                    "rgba(0,100,0,0.03)";
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = "#006400";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isTrackActive) {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.backgroundColor = "transparent";
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = "#666666";
                                }
                              }}
                            >
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  textTransform: "uppercase",
                                }}
                              >
                                {track.title}
                              </span>
                              {!track.isFree && (
                                <Lock
                                  size={12}
                                  style={{
                                    color: "#b0b0b0",
                                    flexShrink: 0,
                                    marginLeft: "8px",
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </nav>

      <div
        style={{
          padding: "8px",
          flexShrink: 0,
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#f5f5f5",
        }}
      >
        <button
          title={!isOpen ? "Logout" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "8px 0",
            borderRadius: "6px",
            transition: "all 0.2s",
            fontSize: "14px",
            fontWeight: 500,
            color: "#101b37",
            gap: "12px",
            justifyContent: isOpen ? "flex-start" : "center",
            paddingLeft: isOpen ? "16px" : "0px",
            paddingRight: isOpen ? "16px" : "0px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
          onClick={async () => {
            try {
              const refreshToken = getRefreshToken();
              if (refreshToken) await authService.logout({ refreshToken });
            } catch {
              // logout failed — clear tokens anyway
            }
            clearTokens();
            window.location.href = "/login";
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#e8eaf0";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent";
          }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}