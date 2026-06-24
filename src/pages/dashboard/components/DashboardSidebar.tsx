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
  Layers,
  FileText,
} from "lucide-react";
import { authService } from "../../../services/authService";
import { courseService } from "../../../services/courseService";
import { getRefreshToken, clearTokens } from "../../../services/tokenService";
import type { Course, ModuleSummary, UnitSummary } from "../../../services/types/course.types";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCoursesLoaded?: (courses: Course[]) => void;
}

interface TrackModules {
  [trackId: number]: ModuleSummary[];
}
interface ModuleUnits {
  [moduleId: number]: UnitSummary[];
}

// Animated collapsible container
function Collapsible({ open, estimatedItemHeight = 38, count = 1, children }: {
  open: boolean;
  estimatedItemHeight?: number;
  count?: number;
  children: React.ReactNode;
}) {
  const maxH = open ? `${estimatedItemHeight * count + 16}px` : "0px";
  return (
    <div style={{
      overflow: "hidden",
      maxHeight: maxH,
      transition: "max-height 0.25s ease",
    }}>
      {children}
    </div>
  );
}

export default function DashboardSidebar({
  activeNav,
  onNavChange,
  isOpen,
  onToggle,
  onCoursesLoaded,
}: DashboardSidebarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(false);

  // Expanded state for each level
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set());
  const [expandedTrackIds, setExpandedTrackIds] = useState<Set<number>>(new Set());
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<number>>(new Set());

  // Lazy-loaded modules and units per track/module
  const [trackModules, setTrackModules] = useState<TrackModules>({});
  const [moduleUnits, setModuleUnits] = useState<ModuleUnits>({});
  const [loadingTracks, setLoadingTracks] = useState<Set<number>>(new Set());
  const [loadingModules, setLoadingModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCoursesLoading(true);
      setCoursesError(false);
      try {
        const data = await courseService.getCourses();
        if (!cancelled) {
          setCourses(data);
          onCoursesLoaded?.(data);
        }
      } catch {
        if (!cancelled) setCoursesError(true);
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [onCoursesLoaded]);

  const toggleCourse = (courseId: number) => {
    setExpandedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) { next.delete(courseId); } else { next.add(courseId); }
      return next;
    });
  };

  const toggleTrack = async (courseId: number, trackId: number) => {
    const isExpanding = !expandedTrackIds.has(trackId);
    setExpandedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) { next.delete(trackId); } else { next.add(trackId); }
      return next;
    });
    // Also navigate to the track view
    onNavChange(`track:${courseId}:${trackId}`);
    // Lazy load modules if expanding and not yet loaded
    if (isExpanding && !trackModules[trackId]) {
      setLoadingTracks((prev) => new Set(prev).add(trackId));
      try {
        const res = await courseService.getTrackModules(trackId);
        const modules = Array.isArray(res?.modules) ? res.modules : [];
        setTrackModules((prev) => ({ ...prev, [trackId]: modules }));
      } catch {
        setTrackModules((prev) => ({ ...prev, [trackId]: [] }));
      } finally {
        setLoadingTracks((prev) => { const s = new Set(prev); s.delete(trackId); return s; });
      }
    }
  };

  const toggleModule = async (moduleId: number) => {
    const isExpanding = !expandedModuleIds.has(moduleId);
    setExpandedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) { next.delete(moduleId); } else { next.add(moduleId); }
      return next;
    });
    if (isExpanding && !moduleUnits[moduleId]) {
      setLoadingModules((prev) => new Set(prev).add(moduleId));
      try {
        const res = await courseService.getModuleUnits(moduleId);
        const units = Array.isArray(res?.units) ? res.units : [];
        setModuleUnits((prev) => ({ ...prev, [moduleId]: units }));
      } catch {
        setModuleUnits((prev) => ({ ...prev, [moduleId]: [] }));
      } finally {
        setLoadingModules((prev) => { const s = new Set(prev); s.delete(moduleId); return s; });
      }
    }
  };

  const isOverviewActive = activeNav === "overview";
  const isAnyCourseActive = activeNav.startsWith("course:") || activeNav.startsWith("track:") || activeNav.startsWith("unit:");


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
      {/* Header */}
      <div style={{
        height: "64px", borderBottom: "1px solid #e0e0e0", display: "flex",
        alignItems: "center", justifyContent: isOpen ? "space-between" : "center",
        paddingLeft: isOpen ? "20px" : "0", paddingRight: isOpen ? "12px" : "0", flexShrink: 0,
      }}>
        {isOpen && (
          <span className="font-headline font-800 text-xl tracking-tight text-primary-500 whitespace-nowrap">
            SLAN <span className="text-tertiary-500">Online</span>
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            padding: "6px", borderRadius: "6px", transition: "background-color 0.2s",
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "transparent", border: "none", cursor: "pointer",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.06)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
        >
          {isOpen ? <X size={20} style={{ color: "#006400" }} /> : <Menu size={20} style={{ color: "#006400" }} />}
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", paddingTop: "8px" }}>
        {/* Overview */}
        <button
          onClick={() => onNavChange("overview")}
          title={!isOpen ? "Overview" : undefined}
          className="w-full flex items-center text-left mb-1"
          style={{
            padding: "14px 0", fontSize: "15px", fontWeight: 600, textTransform: "capitalize",
            letterSpacing: "0.02em", transition: "all 0.15s",
            backgroundColor: isOverviewActive ? "rgba(0,100,0,0.07)" : "transparent",
            color: isOverviewActive ? "#006400" : "rgba(0,100,0,0.45)",
            paddingLeft: isOpen ? (isOverviewActive ? "21px" : "24px") : "0px",
            paddingRight: isOpen ? "24px" : "0px",
            justifyContent: isOpen ? "flex-start" : "center",
            gap: isOpen ? "12px" : "0px", whiteSpace: "nowrap",
            border: "none", cursor: "pointer",
            borderLeftWidth: "3px", borderLeftStyle: "solid",
            borderLeftColor: isOverviewActive ? "#101b37" : "transparent",
          }}
          onMouseEnter={(e) => { if (!isOverviewActive) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "#006400"; } }}
          onMouseLeave={(e) => { if (!isOverviewActive) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,100,0,0.45)"; } }}
        >
          <span style={{ flexShrink: 0 }}><LayoutDashboard size={20} /></span>
          {isOpen && <span>OVERVIEW</span>}
        </button>

        {/* Collapsed sidebar: single icon */}
        {!isOpen && (
          <button
            title="Courses"
            className="w-full flex items-center justify-center mb-1"
            style={{
              padding: "14px 0", transition: "all 0.15s",
              backgroundColor: isAnyCourseActive ? "rgba(0,100,0,0.07)" : "transparent",
              color: isAnyCourseActive ? "#006400" : "rgba(0,100,0,0.45)",
              border: "none", cursor: "pointer",
              borderLeftWidth: "3px", borderLeftStyle: "solid",
              borderLeftColor: isAnyCourseActive ? "#101b37" : "transparent",
            }}
          >
            <BookOpen size={20} />
          </button>
        )}

        {/* Expanded sidebar: full course tree */}
        {isOpen && (
          <div style={{ marginBottom: "4px" }}>
            {coursesLoading && (
              <div style={{ padding: "14px 24px", fontSize: "13px", color: "#b0b0b0", display: "flex", alignItems: "center", gap: "12px" }}>
                <BookOpen size={20} style={{ opacity: 0.5 }} />
                Loading courses…
              </div>
            )}
            {!coursesLoading && coursesError && (
              <div style={{ padding: "12px 24px", fontSize: "12px", color: "#d32f2f", lineHeight: 1.4 }}>
                Couldn't load courses.{" "}
                <button onClick={() => { setCoursesLoading(true); setCoursesError(false); courseService.getCourses().then((data) => { setCourses(data); onCoursesLoaded?.(data); }).catch(() => setCoursesError(true)).finally(() => setCoursesLoading(false)); }} style={{ border: "none", background: "none", color: "#006400", fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}>Retry</button>
              </div>
            )}
            {!coursesLoading && !coursesError && courses.length === 0 && (
              <div style={{ padding: "12px 24px", fontSize: "12px", color: "#b0b0b0" }}>No courses available yet.</div>
            )}

            {!coursesLoading && !coursesError && courses.map((course) => {
              const isCourseExpanded = expandedCourseIds.has(course.id);
              const isCourseActive = activeNav === `course:${course.id}` || activeNav.startsWith(`track:${course.id}:`);

              return (
                <div key={course.id}>
                  {/* Course row — toggle only */}
                  <button
                    onClick={() => toggleCourse(course.id)}
                    aria-expanded={isCourseExpanded}
                    className="w-full flex items-center justify-between text-left mb-1"
                    style={{
                      padding: "14px 24px", fontSize: "15px", fontWeight: 600,
                      letterSpacing: "0.02em", transition: "all 0.15s",
                      backgroundColor: isCourseActive ? "rgba(0,100,0,0.07)" : "transparent",
                      color: isCourseActive ? "#006400" : "rgba(0,100,0,0.45)",
                      paddingLeft: isCourseActive ? "21px" : "24px",
                      whiteSpace: "nowrap", border: "none", cursor: "pointer",
                      borderLeftWidth: "3px", borderLeftStyle: "solid",
                      borderLeftColor: isCourseActive ? "#101b37" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!isCourseActive) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "#006400"; } }}
                    onMouseLeave={(e) => { if (!isCourseActive) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,100,0,0.45)"; } }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                      <span style={{ flexShrink: 0 }}><BookOpen size={20} /></span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{course.title}</span>
                    </span>
                    <span style={{ flexShrink: 0, color: "#b0b0b0" }}>
                      {isCourseExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  </button>

                  {/* Tracks */}
                  <Collapsible open={isCourseExpanded} estimatedItemHeight={38} count={course.tracks.length || 1}>
                    <div style={{ paddingBottom: "4px" }}>
                      {course.tracks.length === 0 && (
                        <div style={{ padding: "8px 24px 8px 56px", fontSize: "12px", color: "#b0b0b0" }}>No tracks yet.</div>
                      )}
                      {course.tracks.map((track) => {
                        const isTrackExpanded = expandedTrackIds.has(track.id);
                        const isTrackActive = activeNav === `track:${course.id}:${track.id}` || activeNav.startsWith(`unit:${course.id}:${track.id}:`);
                        const modules = trackModules[track.id] ?? [];
                        const isLoadingModules = loadingTracks.has(track.id);

                        return (
                          <div key={track.id}>
                            {/* Track row */}
                            <button
                              onClick={() => toggleTrack(course.id, track.id)}
                              title={track.title}
                              className="w-full flex items-center justify-between text-left"
                              style={{
                                padding: "9px 16px 9px 48px", fontSize: "13px", fontWeight: 500,
                                transition: "all 0.15s",
                                backgroundColor: isTrackActive ? "rgba(0,100,0,0.06)" : "transparent",
                                color: isTrackActive ? "#006400" : "#666666",
                                whiteSpace: "nowrap", border: "none", cursor: "pointer",
                                borderLeftWidth: "3px", borderLeftStyle: "solid",
                                borderLeftColor: isTrackActive ? "#d4af37" : "transparent",
                              }}
                              onMouseEnter={(e) => { if (!isTrackActive) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.03)"; (e.currentTarget as HTMLButtonElement).style.color = "#006400"; } }}
                              onMouseLeave={(e) => { if (!isTrackActive) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#666666"; } }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", flex: 1, minWidth: 0 }}>
                                <Layers size={13} style={{ flexShrink: 0, color: "#b0b0b0" }} />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", textTransform: "uppercase", fontSize: "12px" }}>{track.title}</span>
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, marginLeft: "4px" }}>
                                {!track.isFree && <Lock size={11} style={{ color: "#b0b0b0" }} />}
                                {isLoadingModules
                                  ? <div style={{ width: "10px", height: "10px", border: "2px solid #e0e0e0", borderTopColor: "#006400", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                  : isTrackExpanded ? <ChevronDown size={13} style={{ color: "#b0b0b0" }} /> : <ChevronRight size={13} style={{ color: "#b0b0b0" }} />}
                              </span>
                            </button>

                            {/* Modules under track */}
                            <Collapsible open={isTrackExpanded && !isLoadingModules} estimatedItemHeight={36} count={modules.length || 1}>
                              <div>
                                {modules.length === 0 && (
                                  <div style={{ padding: "6px 16px 6px 68px", fontSize: "11px", color: "#b0b0b0" }}>No modules yet.</div>
                                )}
                                {modules.map((mod) => {
                                  const isModExpanded = expandedModuleIds.has(mod.id);
                                  const units = moduleUnits[mod.id] ?? [];
                                  const isLoadingUnits = loadingModules.has(mod.id);

                                  return (
                                    <div key={mod.id}>
                                      {/* Module row */}
                                      <button
                                        onClick={() => toggleModule(mod.id)}
                                        title={mod.title}
                                        className="w-full flex items-center justify-between text-left"
                                        style={{
                                          padding: "8px 16px 8px 64px", fontSize: "12px", fontWeight: 500,
                                          transition: "all 0.15s",
                                          backgroundColor: "transparent",
                                          color: "#888888", whiteSpace: "nowrap",
                                          border: "none", cursor: "pointer",
                                          borderLeftWidth: "3px", borderLeftStyle: "solid",
                                          borderLeftColor: "transparent",
                                        }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.03)"; (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
                                      >
                                        <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", flex: 1, minWidth: 0 }}>
                                          <BookOpen size={12} style={{ flexShrink: 0, color: "#c0c0c0" }} />
                                          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{mod.title}</span>
                                        </span>
                                        <span style={{ flexShrink: 0, marginLeft: "4px" }}>
                                          {isLoadingUnits
                                            ? <div style={{ width: "10px", height: "10px", border: "2px solid #e0e0e0", borderTopColor: "#006400", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                            : isModExpanded ? <ChevronDown size={12} style={{ color: "#c0c0c0" }} /> : <ChevronRight size={12} style={{ color: "#c0c0c0" }} />}
                                        </span>
                                      </button>

                                      {/* Units under module */}
                                      <Collapsible open={isModExpanded && !isLoadingUnits} estimatedItemHeight={32} count={units.length || 1}>
                                        <div>
                                          {units.length === 0 && (
                                            <div style={{ padding: "5px 16px 5px 80px", fontSize: "11px", color: "#b0b0b0" }}>No units yet.</div>
                                          )}
                                          {units.map((unit) => (
                                            <button
                                              key={unit.id}
                                              title={unit.title}
                                              className="w-full text-left"
                                              style={{
                                                padding: "7px 16px 7px 80px", fontSize: "11px", fontWeight: 400,
                                                transition: "all 0.15s", backgroundColor: "transparent",
                                                color: "#aaaaaa", whiteSpace: "nowrap", overflow: "hidden",
                                                textOverflow: "ellipsis", border: "none", cursor: "pointer",
                                                borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "transparent",
                                                display: "flex", alignItems: "center", gap: "6px",
                                              }}
                                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.03)"; (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
                                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#aaaaaa"; }}
                                            >
                                              <FileText size={11} style={{ flexShrink: 0, color: "#d0d0d0" }} />
                                              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{unit.title}</span>
                                            </button>
                                          ))}
                                        </div>
                                      </Collapsible>
                                    </div>
                                  );
                                })}
                              </div>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: "8px", flexShrink: 0, borderTop: "1px solid #e0e0e0", backgroundColor: "#f5f5f5" }}>
        <button
          title={!isOpen ? "Logout" : undefined}
          style={{
            display: "flex", alignItems: "center", width: "100%", padding: "8px 0",
            borderRadius: "6px", transition: "all 0.2s", fontSize: "14px", fontWeight: 500,
            color: "#101b37", gap: "12px", justifyContent: isOpen ? "flex-start" : "center",
            paddingLeft: isOpen ? "16px" : "0px", paddingRight: isOpen ? "16px" : "0px",
            border: "none", backgroundColor: "transparent", cursor: "pointer",
          }}
          onClick={async () => {
            try {
              const refreshToken = getRefreshToken();
              if (refreshToken) await authService.logout({ refreshToken });
            } catch { /* clear tokens anyway */ }
            clearTokens();
            window.location.href = "/login";
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#e8eaf0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}