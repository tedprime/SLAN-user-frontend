import { useState, useMemo, useEffect, useCallback } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import Overview from "./components/Overview";
import CourseTracksView from "./components/CourseTracksView";
import TrackDetailView from "./components/TrackDetailView";
import UnitViewer from "./components/UnitDetailView";
import ReflectionView from "./components/ReflectionView";
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

  // ── Make in-app navigation visible to the browser's back/forward ──
  // Previously every view change was just setActiveNav + sessionStorage,
  // invisible to real browser history. That meant pressing back on
  // /dashboard skipped straight past all in-app views to whatever real
  // navigation happened before /dashboard loaded (e.g. the Google OAuth
  // redirect chain), landing back on Google's sign-in page.
  //
  // Fix: every navigation pushes a history entry carrying the target
  // activeNav. Back/forward then walks through those entries first,
  // updating activeNav via popstate, before ever reaching real
  // navigation outside the app.
  const navigateTo = useCallback((nav: string, replace = false) => {
    setActiveNav(nav);
    if (replace) {
      window.history.replaceState({ activeNav: nav }, "", window.location.pathname);
    } else {
      window.history.pushState({ activeNav: nav }, "", window.location.pathname);
    }
  }, []);

  // Seed the current history entry with state on mount so the first
  // popstate back to it has something to read.
  useEffect(() => {
    window.history.replaceState({ activeNav }, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const nav = e.state?.activeNav;
      if (typeof nav === "string") {
        setActiveNav(nav);
      }
      // If e.state is missing (user has walked back past the app's own
      // entries), let the browser continue its default behavior —
      // that's genuinely "leave the app," which is correct.
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

      const startAtLastUnit = parts[4] === "last";
      const initialUnitId =
        !startAtLastUnit && parts[4] ? parseInt(parts[4], 10) : undefined;

      return { type: "unit" as const, course, track, startAtLastUnit, initialUnitId };
    }

    if (activeNav.startsWith("reflection:")) {
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

      return { type: "reflection" as const, course, track, module: mod };
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
    if (cid) navigateTo(`track:${cid}:${trackId}`);
  };

  const handleBackToCourse = () => {
    if ((viewState.type === "track" || viewState.type === "unit") && viewState.course) {
      navigateTo(`course:${viewState.course.id}`);
    } else {
      navigateTo("overview");
    }
  };

  const handlePlayClick = (module: ModuleSummary) => {
    if (viewState.type === "track" && viewState.track) {
      setSelectedModule(module);
      navigateTo(`unit:${viewState.course?.id}:${viewState.track.id}:${module.id}`);
    }
  };

  const handleModuleNavigate = (module: ModuleSummary, courseId: number, trackId: number, unitId?: number) => {
    setSelectedModule(module);
    const suffix = unitId ? `:${unitId}` : "";
    navigateTo(`unit:${courseId}:${trackId}:${module.id}${suffix}`);
  };

  const handleModuleClick = (module: ModuleSummary) => {
    console.log("Module clicked:", module.id);
  };

  const handleTakeAssessment = (module: ModuleSummary, hasReflection: boolean) => {
    if (viewState.type === "unit" && viewState.course && viewState.track) {
      setSelectedModule(module);
      if (hasReflection) {
        navigateTo(`reflection:${viewState.course.id}:${viewState.track.id}:${module.id}`);
      } else {
        navigateTo(`assessment:${viewState.course.id}:${viewState.track.id}:${module.id}`);
      }
    }
  };

  const handleReflectionContinue = () => {
    if (viewState.type === "reflection" && viewState.course && viewState.track && viewState.module) {
      navigateTo(`assessment:${viewState.course.id}:${viewState.track.id}:${viewState.module.id}`);
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
      navigateTo(`track:${viewState.course.id}:${viewState.track.id}`);
    }
    handleProgressChange();
  };

  const handleAssessmentExit = () => {
    if (viewState.type === "assessment" && viewState.course && viewState.track) {
      setSelectedModule(viewState.module);
      navigateTo(`unit:${viewState.course.id}:${viewState.track.id}:${viewState.module.id}:last`);
    } else {
      navigateTo("overview");
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
      activeNav.startsWith("unit:") || activeNav.startsWith("assessment:") || activeNav.startsWith("reflection:");
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
          navigateTo(`track:${courseId}:${trackId}`, true);
        }
      } catch {
        if (!cancelled) navigateTo(`track:${courseId}:${trackId}`, true);
      }
    })();

    return () => { cancelled = true; };
  }, [activeNav, selectedModule, courses, trackModules, handleModulesLoaded, navigateTo]);

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
          onNavChange={navigateTo}
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
              onCourseClick={(courseId) => navigateTo(`course:${courseId}`)}
              onResumeClick={(courseId, trackId) => navigateTo(`track:${courseId}:${trackId}`)}
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
              initialUnitId={viewState.initialUnitId}
              onBack={handleBackToCourse}
              onBackToTrack={() => {
                if (viewState.type === "unit" && viewState.course && viewState.track) {
                  navigateTo(`track:${viewState.course.id}:${viewState.track.id}`);
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

          {viewState.type === "reflection" && viewState.course && viewState.track && viewState.module && (
            <ReflectionView
              moduleId={viewState.module.id}
              moduleTitle={viewState.module.title}
              courseName={viewState.course.title}
              trackName={viewState.track.title}
              onBack={() => navigateTo(`unit:${viewState.course!.id}:${viewState.track!.id}:${viewState.module!.id}:last`)}
              onContinue={handleReflectionContinue}
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
