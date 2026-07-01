import { useState, useEffect, useCallback } from "react";
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
  CheckCircle,
} from "lucide-react";
import { authService } from "../../../services/authService";
import { courseService } from "../../../services/courseService";
import { progressService } from "../../../services/progressService";
import { getRefreshToken, clearTokens, getAccessToken } from "../../../services/tokenService";
import type { Course, ModuleSummary, UnitSummary } from "../../../services/types/course.types";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCoursesLoaded?: (courses: Course[]) => void;
  onModuleNavigate?: (module: ModuleSummary, courseId: number, trackId: number) => void;
  progressVersion?: number;
}

interface TrackModules { [trackId: number]: ModuleSummary[]; }
interface ModuleUnits { [moduleId: number]: UnitSummary[]; }

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

// Unwrap API envelope { success, data } defensively
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && typeof res === "object" && "data" in res) return res.data as T;
  return res as T;
}

function Collapsible({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
      <div style={{ overflow: "hidden", minHeight: 0 }}>{children}</div>
    </div>
  );
}

export default function DashboardSidebar({
  activeNav,
  onNavChange,
  isOpen,
  onToggle,
  onCoursesLoaded,
  onModuleNavigate,
  progressVersion,
}: DashboardSidebarProps) {
  const isMobile = useIsMobile();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(false);

  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set());
  const [expandedTrackIds, setExpandedTrackIds] = useState<Set<number>>(new Set());
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<number>>(new Set());

  const [trackModules, setTrackModules] = useState<TrackModules>({});
  const [moduleUnits, setModuleUnits] = useState<ModuleUnits>({});
  const [loadingTracks, setLoadingTracks] = useState<Set<number>>(new Set());
  const [loadingModules, setLoadingModules] = useState<Set<number>>(new Set());

  const [completedUnitIdsByTrack, setCompletedUnitIdsByTrack] = useState<Record<number, Set<number>>>({});

  const handleNavChange = (id: string) => {
    onNavChange(id);
    if (isMobile && isOpen) onToggle();
  };
  const handleModuleNavigate = (mod: ModuleSummary, courseId: number, trackId: number) => {
    onModuleNavigate?.(mod, courseId, trackId);
    if (isMobile && isOpen) onToggle();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCoursesLoading(true);
      setCoursesError(false);
      try {
        const data = await courseService.getCourses();
        if (!cancelled) { setCourses(data); onCoursesLoaded?.(data); }
      } catch {
        if (!cancelled) setCoursesError(true);
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [onCoursesLoaded]);

  useEffect(() => {
    if (courses.length === 0) return;
    let cancelled = false;
    const allTracks = courses.flatMap((c) => c.tracks);
    (async () => {
      await Promise.all(
        allTracks.map(async (track) => {
          if (cancelled) return;
          setLoadingTracks((prev) => new Set(prev).add(track.id));
          try {
            const res = await courseService.getTrackModules(track.id);
            const modules = Array.isArray(res?.modules) ? res.modules : [];
            if (cancelled) return;
            setTrackModules((prev) => ({ ...prev, [track.id]: modules }));
            await Promise.all(
              modules.map(async (mod) => {
                setLoadingModules((prev) => new Set(prev).add(mod.id));
                try {
                  const unitsRes = await courseService.getModuleUnits(mod.id);
                  const units = Array.isArray(unitsRes?.units) ? unitsRes.units : [];
                  if (!cancelled) setModuleUnits((prev) => ({ ...prev, [mod.id]: units }));
                } catch {
                  if (!cancelled) setModuleUnits((prev) => ({ ...prev, [mod.id]: [] }));
                } finally {
                  setLoadingModules((prev) => { const s = new Set(prev); s.delete(mod.id); return s; });
                }
              })
            );
          } catch {
            if (!cancelled) setTrackModules((prev) => ({ ...prev, [track.id]: [] }));
          } finally {
            setLoadingTracks((prev) => { const s = new Set(prev); s.delete(track.id); return s; });
          }
        })
      );
    })();
    return () => { cancelled = true; };
  }, [courses]);

  const refreshCompletionForTrack = useCallback(async (trackId: number) => {
    // Don't attempt progress fetch if there's no auth token — avoid 401 flood
    if (!getAccessToken() && !getRefreshToken()) return;
    try {
      const raw = await progressService.getTrackCompletedUnits(trackId);
      // Unwrap envelope and handle both array and wrapped forms
      const entries: { unitId: number }[] = Array.isArray(raw)
        ? raw
        : Array.isArray(unwrap<{ unitId: number }[]>(raw))
        ? unwrap<{ unitId: number }[]>(raw)
        : [];
      setCompletedUnitIdsByTrack((prev) => ({
        ...prev,
        [trackId]: new Set(entries.map((e) => e.unitId)),
      }));
    } catch { /* keep existing state */ }
  }, []);

  useEffect(() => {
    if (courses.length === 0) return;
    let cancelled = false;
    const allTracks = courses.flatMap((c) => c.tracks);
    (async () => {
      await Promise.all(
        allTracks.map((track) => (cancelled ? Promise.resolve() : refreshCompletionForTrack(track.id)))
      );
    })();
    return () => { cancelled = true; };
  }, [courses, progressVersion, refreshCompletionForTrack]);

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
    onNavChange(`track:${courseId}:${trackId}`);
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

  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed", top: 0, left: 0,
        height: "100dvh",
        width: "280px",
        backgroundColor: "#ffffff", borderRight: "1px solid #e8e8e8",
        display: "flex", flexDirection: "column", zIndex: 50,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease", overflow: "hidden",
        boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.10)" : "none",
      }
    : {
        backgroundColor: "#ffffff",
        width: isOpen ? "260px" : "60px",
        borderRight: "1px solid #e8e8e8",
        height: "100dvh", overflow: "hidden",
        transition: "width 0.25s ease",
        flexShrink: 0, display: "flex", flexDirection: "column", zIndex: 20,
      };

  const sidebar = (
    <div style={sidebarStyle}>
      {/* Header */}
      <div style={{
        height: "64px", borderBottom: "1px solid #e8e8e8", display: "flex",
        alignItems: "center", justifyContent: isOpen ? "space-between" : "center",
        paddingLeft: isOpen ? "20px" : "0", paddingRight: isOpen ? "10px" : "0", flexShrink: 0,
        backgroundColor: "#ffffff",
      }}>
        {isOpen && (
          <span style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em", color: "#101b37", whiteSpace: "nowrap", fontFamily: "var(--font-headline)" }}>
            SLAN <span style={{ color: "#006400" }}>Online</span>
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            padding: "6px", borderRadius: "8px", transition: "background-color 0.15s",
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "transparent", border: "none", cursor: "pointer",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
        >
          {isOpen ? <X size={18} style={{ color: "#888888" }} /> : <Menu size={18} style={{ color: "#888888" }} />}
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 0 8px", minHeight: 0, height: 0 }}>
        {/* Overview */}
        <button
          onClick={() => handleNavChange("overview")}
          title={!isOpen ? "Overview" : undefined}
          className="w-full flex items-center text-left"
          style={{
            padding: isOpen ? "9px 16px" : "10px 0",
            margin: isOpen ? "0 8px" : "0",
            width: isOpen ? "calc(100% - 16px)" : "100%",
            borderRadius: isOpen ? "8px" : "0",
            fontSize: "13px", fontWeight: isOverviewActive ? 600 : 500,
            transition: "all 0.15s",
            backgroundColor: isOverviewActive ? "rgba(0,100,0,0.08)" : "transparent",
            color: isOverviewActive ? "#006400" : "#666666",
            justifyContent: isOpen ? "flex-start" : "center",
            gap: isOpen ? "10px" : "0",
            border: "none", cursor: "pointer",
          }}
          onMouseEnter={(e) => { if (!isOverviewActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; }}
          onMouseLeave={(e) => { if (!isOverviewActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
        >
          <LayoutDashboard size={17} style={{ flexShrink: 0, color: isOverviewActive ? "#006400" : "#aaaaaa" }} />
          {isOpen && <span>Overview</span>}
        </button>

        {/* Collapsed sidebar: courses icon */}
        {!isOpen && !isMobile && (
          <button
            title="Courses"
            className="w-full flex items-center justify-center"
            style={{
              padding: "10px 0", marginTop: "4px", transition: "all 0.15s",
              width: "100%", margin: "0",
              backgroundColor: isAnyCourseActive ? "rgba(0,100,0,0.08)" : "transparent",
              color: isAnyCourseActive ? "#006400" : "#aaaaaa",
              border: "none", cursor: "pointer",
            }}
          >
            <BookOpen size={17} />
          </button>
        )}

        {/* Section label */}
        {isOpen && (
          <div style={{
            padding: "16px 24px 6px",
            fontSize: "10px", fontWeight: 700, color: "#cccccc",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            Courses
          </div>
        )}

        {/* Expanded sidebar: full course tree */}
        {isOpen && (
          <div>
            {coursesLoading && (
              <div style={{ padding: "10px 24px", fontSize: "12px", color: "#bbbbbb", display: "flex", alignItems: "center", gap: "10px" }}>
                <BookOpen size={15} style={{ opacity: 0.4 }} />
                Loading…
              </div>
            )}
            {!coursesLoading && coursesError && (
              <div style={{ padding: "10px 24px", fontSize: "12px", color: "#d32f2f", lineHeight: 1.4 }}>
                Couldn't load courses.{" "}
                <button onClick={() => { setCoursesLoading(true); setCoursesError(false); courseService.getCourses().then((data) => { setCourses(data); onCoursesLoaded?.(data); }).catch(() => setCoursesError(true)).finally(() => setCoursesLoading(false)); }} style={{ border: "none", background: "none", color: "#006400", fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}>Retry</button>
              </div>
            )}
            {!coursesLoading && !coursesError && courses.length === 0 && (
              <div style={{ padding: "10px 24px", fontSize: "12px", color: "#bbbbbb" }}>No courses yet.</div>
            )}

            {!coursesLoading && !coursesError && courses.map((course) => {
              const isCourseExpanded = expandedCourseIds.has(course.id);
              const isCourseActive = activeNav === `course:${course.id}` || activeNav.startsWith(`track:${course.id}:`);

              return (
                <div key={course.id} style={{ marginBottom: "2px" }}>
                  {/* Course row */}
                  <button
                    onClick={() => toggleCourse(course.id)}
                    aria-expanded={isCourseExpanded}
                    className="w-full flex items-center justify-between text-left"
                    style={{
                      padding: "9px 16px", margin: "0 8px", width: "calc(100% - 16px)",
                      borderRadius: "8px", fontSize: "13px", fontWeight: isCourseActive ? 600 : 500,
                      transition: "all 0.15s",
                      backgroundColor: isCourseActive ? "rgba(0,100,0,0.08)" : "transparent",
                      color: isCourseActive ? "#006400" : "#555555",
                      border: "none", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { if (!isCourseActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; }}
                    onMouseLeave={(e) => { if (!isCourseActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "9px", overflow: "hidden", flex: 1, minWidth: 0 }}>
                      <BookOpen size={15} style={{ flexShrink: 0, color: isCourseActive ? "#006400" : "#aaaaaa" }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase" }}>{course.title}</span>
                    </span>
                    <span style={{ flexShrink: 0, color: "#cccccc", marginLeft: "6px" }}>
                      {isCourseExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </button>

                  <Collapsible open={isCourseExpanded}>
                    <div style={{ paddingBottom: "4px" }}>
                      {course.tracks.length === 0 && (
                        <div style={{ padding: "6px 16px 6px 52px", fontSize: "11px", color: "#cccccc" }}>No tracks yet.</div>
                      )}
                      {course.tracks.map((track) => {
                        const isTrackExpanded = expandedTrackIds.has(track.id);
                        const isTrackActive = activeNav === `track:${course.id}:${track.id}` || activeNav.startsWith(`unit:${course.id}:${track.id}:`);
                        const modules = trackModules[track.id] ?? [];
                        const isLoadingTrackModules = loadingTracks.has(track.id);
                        const completedUnitIds = completedUnitIdsByTrack[track.id] ?? new Set<number>();

                        const isModuleComplete = (mod: ModuleSummary) => {
                          const units = moduleUnits[mod.id];
                          if (!units || units.length === 0) return false;
                          return units.every((u) => completedUnitIds.has(u.id));
                        };
                        const isTrackComplete = modules.length > 0 && modules.every((mod) => isModuleComplete(mod));

                        return (
                          <div key={track.id}>
                            {/* Track row */}
                            <button
                              onClick={() => toggleTrack(course.id, track.id)}
                              title={track.title}
                              className="w-full flex items-center justify-between text-left"
                              style={{
                                padding: "7px 12px 7px 40px",
                                margin: "1px 8px", width: "calc(100% - 16px)",
                                borderRadius: "7px", fontSize: "12px", fontWeight: isTrackActive ? 600 : 400,
                                transition: "all 0.15s",
                                backgroundColor: isTrackActive ? "rgba(0,100,0,0.07)" : "transparent",
                                color: isTrackActive ? "#006400" : "#777777",
                                border: "none", cursor: "pointer",
                              }}
                              onMouseEnter={(e) => { if (!isTrackActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; }}
                              onMouseLeave={(e) => { if (!isTrackActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: "7px", overflow: "hidden", flex: 1, minWidth: 0 }}>
                                <Layers size={12} style={{ flexShrink: 0, color: isTrackActive ? "#006400" : "#cccccc" }} />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase" }}>{track.title}</span>
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, marginLeft: "4px" }}>
                                {isTrackComplete && <CheckCircle size={11} style={{ color: "#10b981" }} />}
                                {!track.isFree && <Lock size={10} style={{ color: "#dddddd" }} />}
                                {isLoadingTrackModules
                                  ? <div style={{ width: "10px", height: "10px", border: "2px solid #e0e0e0", borderTopColor: "#006400", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                  : isTrackExpanded ? <ChevronDown size={12} style={{ color: "#cccccc" }} /> : <ChevronRight size={12} style={{ color: "#cccccc" }} />}
                              </span>
                            </button>

                            <Collapsible open={isTrackExpanded && !isLoadingTrackModules}>
                              <div>
                                {modules.length === 0 && (
                                  <div style={{ padding: "5px 12px 5px 60px", fontSize: "11px", color: "#cccccc" }}>No modules yet.</div>
                                )}
                                {modules.map((mod, modIndex) => {
                                  // A module is locked unless it's the first in the track, or the
                                  // module directly before it has been fully completed — mirrors
                                  // the lock logic in TrackDetailView.tsx.
                                  const locked = modIndex > 0 && !isModuleComplete(modules[modIndex - 1]);
                                  const isModExpanded = expandedModuleIds.has(mod.id) && !locked;
                                  const units = moduleUnits[mod.id] ?? [];
                                  const isLoadingUnits = loadingModules.has(mod.id);
                                  const isModuleActive = activeNav === `unit:${course.id}:${track.id}:${mod.id}`;
                                  const moduleComplete = units.length > 0 && units.every((u) => completedUnitIds.has(u.id));

                                  return (
                                    <div key={mod.id}>
                                      {/* Module row */}
                                      <div
                                        className="w-full flex items-center justify-between"
                                        style={{
                                          margin: "1px 8px", width: "calc(100% - 16px)",
                                          borderRadius: "7px",
                                          backgroundColor: isModuleActive ? "rgba(0,100,0,0.06)" : "transparent",
                                          opacity: locked ? 0.55 : 1,
                                        }}
                                      >
                                        <button
                                          onClick={() => { if (!locked) handleModuleNavigate(mod, course.id, track.id); }}
                                          disabled={locked}
                                          title={locked ? "Complete the previous module to unlock" : mod.title}
                                          className="flex items-center text-left flex-1"
                                          style={{
                                            padding: "6px 0 6px 56px", fontSize: "12px", fontWeight: isModuleActive ? 600 : 400,
                                            transition: "color 0.15s", overflow: "hidden", minWidth: 0,
                                            backgroundColor: "transparent",
                                            color: locked ? "#bbbbbb" : isModuleActive ? "#006400" : "#888888",
                                            border: "none", cursor: locked ? "not-allowed" : "pointer", gap: "7px",
                                            borderRadius: "7px 0 0 7px",
                                          }}
                                          onMouseEnter={(e) => { if (!locked) (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
                                          onMouseLeave={(e) => { if (!locked && !isModuleActive) (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
                                        >
                                          {locked
                                            ? <Lock size={11} style={{ flexShrink: 0, color: "#cccccc" }} />
                                            : <BookOpen size={11} style={{ flexShrink: 0, color: isModuleActive ? "#006400" : "#dddddd" }} />}
                                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.title}</span>
                                          {moduleComplete && !locked && <CheckCircle size={10} style={{ color: "#10b981", flexShrink: 0 }} />}
                                        </button>
                                        {!locked && (
                                          <button
                                            onClick={() => toggleModule(mod.id)}
                                            title={isModExpanded ? "Collapse units" : "Expand units"}
                                            style={{
                                              background: "transparent", border: "none", cursor: "pointer",
                                              padding: "6px 8px", display: "flex", alignItems: "center", flexShrink: 0,
                                              borderRadius: "0 7px 7px 0",
                                            }}
                                          >
                                            {isLoadingUnits
                                              ? <div style={{ width: "9px", height: "9px", border: "2px solid #e0e0e0", borderTopColor: "#006400", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                              : isModExpanded ? <ChevronDown size={11} style={{ color: "#cccccc" }} /> : <ChevronRight size={11} style={{ color: "#cccccc" }} />}
                                          </button>
                                        )}
                                      </div>

                                      <Collapsible open={isModExpanded && !isLoadingUnits}>
                                        <div>
                                          {units.length === 0 && (
                                            <div style={{ padding: "4px 12px 4px 72px", fontSize: "11px", color: "#cccccc" }}>No units yet.</div>
                                          )}
                                          {units.map((unit, unitIndex) => {
                                            const isUnitActive = activeNav === `unit:${course.id}:${track.id}:${mod.id}:${unit.id}`;
                                            const isUnitComplete = completedUnitIds.has(unit.id);
                                            return (
                                              <button
                                                key={unit.id}
                                                title={unit.title}
                                                onClick={() => {
                                                  handleModuleNavigate(mod, course.id, track.id);
                                                  // Signal which specific unit to open
                                                  onNavChange(`unit:${course.id}:${track.id}:${mod.id}:${unit.id}`);
                                                  if (isMobile && isOpen) onToggle();
                                                }}
                                                className="w-full text-left"
                                                style={{
                                                  padding: "5px 12px 5px 72px",
                                                  margin: "1px 8px", width: "calc(100% - 16px)",
                                                  borderRadius: "6px",
                                                  fontSize: "11px", fontWeight: 400,
                                                  transition: "all 0.15s",
                                                  backgroundColor: isUnitActive ? "rgba(0,100,0,0.05)" : "transparent",
                                                  color: isUnitActive ? "#006400" : "#aaaaaa",
                                                  border: "none", cursor: "pointer",
                                                  display: "flex", alignItems: "center", gap: "6px",
                                                }}
                                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; (e.currentTarget as HTMLButtonElement).style.color = "#555555"; }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isUnitActive ? "rgba(0,100,0,0.05)" : "transparent"; (e.currentTarget as HTMLButtonElement).style.color = isUnitActive ? "#006400" : "#aaaaaa"; }}
                                              >
                                                {/* Fixed-width icon slot */}
                                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "14px", flexShrink: 0 }}>
                                                  {isUnitComplete
                                                    ? <CheckCircle size={10} style={{ color: "#10b981" }} />
                                                    : <FileText size={10} style={{ color: "#e0e0e0" }} />}
                                                </span>
                                                <span style={{ whiteSpace: "nowrap" }}>Unit {unitIndex + 1}</span>
                                              </button>
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
                  </Collapsible>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: "8px 8px 12px", flexShrink: 0, borderTop: "1px solid #f0f0f0" }}>
        <button
          title={!isOpen ? "Logout" : undefined}
          style={{
            display: "flex", alignItems: "center", width: "100%",
            padding: isOpen ? "8px 12px" : "8px 0",
            borderRadius: "8px", transition: "all 0.15s", fontSize: "13px", fontWeight: 500,
            color: "#888888", gap: "10px", justifyContent: isOpen ? "flex-start" : "center",
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
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fef2f2"; (e.currentTarget as HTMLButtonElement).style.color = "#d32f2f"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            onClick={onToggle}
            style={{
              position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)",
              zIndex: 40, transition: "opacity 0.25s ease",
              // Prevent iOS from scrolling the page behind the overlay
              touchAction: "none",
              WebkitOverflowScrolling: "auto" as React.CSSProperties["WebkitOverflowScrolling"],
            }}
          />
        )}
        {sidebar}
      </>
    );
  }

  return sidebar;
}