import { useState, useMemo, useEffect, useCallback } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import Overview from "./components/Overview";
import CourseTracksView from "./components/CourseTracksView";
import TrackDetailView from "./components/TrackDetailView";
import UnitViewer from "./components/UnitDetailView";
import AssessmentView from "./components/AssessmentView";
import { courseService } from "../../services/courseService";
import type { Course, ModuleSummary } from "../../services/types/course.types";

const STORAGE_KEY = "dashboard_active_nav";
const SIDEBAR_KEY = "dashboard_sidebar_open";

function getInitialSidebarState(): boolean {
  if (typeof window !== "undefined" && window.innerWidth < 768) return false;
  const stored = sessionStorage.getItem(SIDEBAR_KEY);
  return stored === null ? true : stored === "true";
}

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || "overview";
  });

  const [searchVal, setSearchVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleSummary | null>(null);
  const [trackModules, setTrackModules] = useState<Record<number, ModuleSummary[]>>({});
  const [progressVersion, setProgressVersion] = useState(0);
  const handleProgressChange = () => setProgressVersion((v) => v + 1);

  // True while an assessment attempt (taking/submitting/results) is active.
  // The sidebar hides for those phases; the intro screen keeps it visible.
  const [assessmentExamActive, setAssessmentExamActive] = useState(false);

  // Sync activeNav changes to sessionStorage safely
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, activeNav);
  }, [activeNav]);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      sessionStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  };

  // Derive the active view state directly from existing parameters
  const viewState = useMemo(() => {
    if (activeNav === "overview") return { type: "overview" as const };

    // While courses are loading, show the spinner if we are trying to access a deep route
    if (courses.length === 0 && activeNav !== "overview") {
      return { type: "loading" as const };
    }

    if (activeNav.startsWith("course:")) {
      const courseId = parseInt(activeNav.replace("course:", ""), 10);
      const course = courses.find((c) => c.id === courseId);
      if (!course) return { type: "overview" as const }; // Safe render fallback
      return { type: "course" as const, course };
    }

    if (activeNav.startsWith("track:")) {
      const parts = activeNav.split(":");
      const courseId = parseInt(parts[1], 10);
      const trackId = parseInt(parts[2], 10);
      const course = courses.find((c) => c.id === courseId);
      const track = course?.tracks.find((t) => t.id === trackId);
      if (!course || !track) return { type: "overview" as const };
      return { type: "track" as const, course, track };
    }

    if (activeNav.startsWith("unit:")) {
      const parts = activeNav.split(":");
      const courseId = parseInt(parts[1], 10);
      const trackId = parseInt(parts[2], 10);
      const course = courses.find((c) => c.id === courseId);
      const track = course?.tracks.find((t) => t.id === trackId);
      
      if (!course || !track) return { type: "overview" as const };

      if (!selectedModule) {
        return { type: "loading" as const };
      }

      return { type: "unit" as const, course, track, startAtLastUnit: parts[4] === "last" };
    }

    if (activeNav.startsWith("assessment:")) {
      const parts = activeNav.split(":");
      const courseId = parseInt(parts[1], 10);
      const trackId = parseInt(parts[2], 10);
      const moduleId = parseInt(parts[3], 10);
      const course = courses.find((c) => c.id === courseId);
      const track = course?.tracks.find((t) => t.id === trackId);

      if (!course || !track) return { type: "overview" as const };

      const mod =
        selectedModule && selectedModule.id === moduleId
          ? selectedModule
          : (trackModules[trackId]?.find((m) => m.id === moduleId) ?? null);

      if (!mod) return { type: "loading" as const };

      return { type: "assessment" as const, course, track, module: mod };
    }

    return { type: "overview" as const };
  }, [activeNav, courses, selectedModule, trackModules]);

  // --- THE OFFENDING EFFECT WAS COMPLETELY REMOVED FROM HERE ---

  const handleTrackClick = (trackId: number, courseId?: number) => {
    const cid = courseId || (viewState.type === "course" ? viewState.course?.id : undefined);
    if (cid) setActiveNav(`track:${cid}:${trackId}`);
  };

  const handleBackToCourse = () => {
    if ((viewState.type === "track" || viewState.type === "unit") && viewState.course) {
      setActiveNav(`course:${viewState.course.id}`);
    } else {
      setActiveNav("overview");
    }
  };

  const handlePlayClick = (module: ModuleSummary) => {
    if (viewState.type === "track" && viewState.track) {
      setSelectedModule(module);
      setActiveNav(`unit:${viewState.course?.id}:${viewState.track.id}:${module.id}`);
    }
  };

  const handleModuleNavigate = (module: ModuleSummary, courseId: number, trackId: number) => {
    setSelectedModule(module);
    setActiveNav(`unit:${courseId}:${trackId}:${module.id}`);
  };

  const handleModuleClick = (module: ModuleSummary) => {
    console.log("Module clicked:", module.id);
  };

  const handleTakeAssessment = (module: ModuleSummary) => {
    if (viewState.type === "unit" && viewState.course && viewState.track) {
      setSelectedModule(module);
      setActiveNav(`assessment:${viewState.course.id}:${viewState.track.id}:${module.id}`);
    }
  };

  // After a passed (or exited) assessment: advance to the next module's
  // first unit if one exists, otherwise drop back to the track view.
  const handleAssessmentFinish = () => {
    if (viewState.type !== "assessment" || !viewState.course || !viewState.track) return;
    const mods = trackModules[viewState.track.id] || [];
    const idx = mods.findIndex((m) => m.id === viewState.module.id);
    const next = idx >= 0 && idx < mods.length - 1 ? mods[idx + 1] : null;
    if (next) {
      handleModuleNavigate(next, viewState.course.id, viewState.track.id);
    } else {
      setActiveNav(`track:${viewState.course.id}:${viewState.track.id}`);
    }
    handleProgressChange();
  };

  const handleAssessmentExit = () => {
    if (viewState.type === "assessment" && viewState.course && viewState.track) {
      setSelectedModule(viewState.module);
      setActiveNav(`unit:${viewState.course.id}:${viewState.track.id}:${viewState.module.id}:last`);
    } else {
      setActiveNav("overview");
    }
  };

  const handleModulesLoaded = useCallback((trackId: number, mods: ModuleSummary[]) => {
    setTrackModules((prev) => {
      if (prev[trackId] === mods) return prev;
      return { ...prev, [trackId]: mods };
    });
  }, []);

  // Resolves modules if we land on a unit or assessment URL directly
  useEffect(() => {
    const needsModule =
      activeNav.startsWith("unit:") || activeNav.startsWith("assessment:");
    if (!needsModule || selectedModule) return;
    if (courses.length === 0) return;

    const parts = activeNav.split(":");
    const courseId = parseInt(parts[1], 10);
    const trackId = parseInt(parts[2], 10);
    const moduleId = parseInt(parts[3], 10);
    
    const course = courses.find((c) => c.id === courseId);
    const track = course?.tracks.find((t) => t.id === trackId);

    // If the path is corrupt, let viewState naturally handle rendering the overview page.
    if (!course || !track) return;

    let cancelled = false;
    (async () => {
      try {
        let mods = trackModules[trackId];
        if (!mods) {
          const res = await courseService.getTrackModules(trackId);
          mods = Array.isArray(res?.modules) ? res.modules : [];
          if (!cancelled) handleModulesLoaded(trackId, mods);
        }
        const found = mods.find((m) => m.id === moduleId) ?? null;
        if (cancelled) return;
        if (found) {
          setSelectedModule(found);
        } else {
          setActiveNav(`track:${courseId}:${trackId}`);
        }
      } catch {
        if (!cancelled) setActiveNav(`track:${courseId}:${trackId}`);
      }
    })();

    return () => { cancelled = true; };
  }, [activeNav, selectedModule, courses, trackModules, handleModulesLoaded]);

  return (
    <div style={{
      display: "flex",
      height: "100dvh",
      minHeight: "-webkit-fill-available",
      width: "100vw",
      overflow: "hidden",
      backgroundColor: "#fafafa",
    }}>
      {!assessmentExamActive && (
        <DashboardSidebar
          activeNav={activeNav}
          onNavChange={setActiveNav}
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
          onCoursesLoaded={setCourses}
          onModuleNavigate={handleModuleNavigate}
          progressVersion={progressVersion}
        />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {!assessmentExamActive && (
          <DashboardHeader
            activeNav={activeNav}
            searchVal={searchVal}
            onSearchChange={setSearchVal}
            onMenuClick={handleToggleSidebar}
          />
        )}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          {viewState.type === "loading" && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa", minHeight: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px",
                  border: "3px solid #e8e8e8", borderTopColor: "#006400",
                  borderRadius: "50%", animation: "spin 1s linear infinite",
                }} />
                <p style={{ fontSize: "14px", color: "#888888" }}>Loading...</p>
              </div>
            </div>
          )}

          {viewState.type === "overview" && (
            <Overview
              onCourseClick={(courseId) => setActiveNav(`course:${courseId}`)}
              onResumeClick={(courseId, trackId) => setActiveNav(`track:${courseId}:${trackId}`)}
            />
          )}

          {viewState.type === "course" && viewState.course && (
            <CourseTracksView
              course={viewState.course}
              onTrackClick={(trackId) => handleTrackClick(trackId, viewState.course?.id)}
            />
          )}

          {viewState.type === "track" && viewState.course && viewState.track && (
            <TrackDetailView
              course={viewState.course}
              track={viewState.track}
              onBack={handleBackToCourse}
              onModuleClick={handleModuleClick}
              onPlayClick={handlePlayClick}
              onModulesLoaded={(mods) => handleModulesLoaded(viewState.track!.id, mods)}
            />
          )}

          {viewState.type === "unit" && viewState.course && viewState.track && selectedModule && (
            <UnitViewer
              courseId={viewState.course.id}
              trackId={viewState.track.id}
              module={selectedModule}
              allModules={trackModules[viewState.track.id]}
              courseName={viewState.course.title}
              trackName={viewState.track.title}
              startAtLastUnit={viewState.startAtLastUnit}
              onBack={handleBackToCourse}
              onBackToTrack={() => {
                if (viewState.type === "unit" && viewState.course && viewState.track) {
                  setActiveNav(`track:${viewState.course.id}:${viewState.track.id}`);
                }
              }}
              onProgressChange={handleProgressChange}
              onNextModule={(nextMod) => {
                if (viewState.type === "unit" && viewState.course && viewState.track) {
                  handleModuleNavigate(nextMod, viewState.course.id, viewState.track.id);
                }
              }}
              onTakeAssessment={handleTakeAssessment}
            />
          )}

          {viewState.type === "assessment" && viewState.course && viewState.track && viewState.module && (
            <AssessmentView
              moduleId={viewState.module.id}
              moduleTitle={viewState.module.title}
              moduleNumber={
                (trackModules[viewState.track.id]?.findIndex((m) => m.id === viewState.module.id) ?? -1) + 1 || undefined
              }
              courseName={viewState.course.title}
              trackName={viewState.track.title}
              onExit={handleAssessmentExit}
              onFinish={handleAssessmentFinish}
              onExamActiveChange={setAssessmentExamActive}
            />
          )}
        </main>
      </div>
    </div>
  );
}