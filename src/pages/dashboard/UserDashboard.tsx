import { useState, useMemo, useEffect, useCallback } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import Overview from "./components/Overview";
import CourseTracksView from "./components/CourseTracksView";
import TrackDetailView from "./components/TrackDetailView";
import UnitViewer from "./components/UnitDetailView";
import type { Course, ModuleSummary } from "../../services/types/course.types";

const STORAGE_KEY = "dashboard_active_nav";
const SIDEBAR_KEY = "dashboard_sidebar_open";

function getInitialSidebarState(): boolean {
  // Default closed on mobile so the drawer doesn't cover the whole screen on first load
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

  const viewState = useMemo(() => {
    if (activeNav.startsWith("unit:") && !selectedModule) {
      const parts = activeNav.split(":");
      const courseId = parseInt(parts[1], 10);
      const trackId = parseInt(parts[2], 10);
      const course = courses.find((c) => c.id === courseId);
      const track = course?.tracks.find((t) => t.id === trackId);
      if (course && track) return { type: "track" as const, course, track };
      return { type: "overview" as const };
    }

    if (activeNav === "overview") return { type: "overview" as const };
    if (activeNav.startsWith("course:")) {
      const courseId = parseInt(activeNav.replace("course:", ""), 10);
      const course = courses.find((c) => c.id === courseId);
      return { type: "course" as const, course };
    }
    if (activeNav.startsWith("track:")) {
      const parts = activeNav.split(":");
      const courseId = parseInt(parts[1], 10);
      const trackId = parseInt(parts[2], 10);
      const course = courses.find((c) => c.id === courseId);
      const track = course?.tracks.find((t) => t.id === trackId);
      return { type: "track" as const, course, track };
    }
    if (activeNav.startsWith("unit:")) {
      const parts = activeNav.split(":");
      const courseId = parseInt(parts[1], 10);
      const trackId = parseInt(parts[2], 10);
      const course = courses.find((c) => c.id === courseId);
      const track = course?.tracks.find((t) => t.id === trackId);
      return { type: "unit" as const, course, track };
    }
    return { type: "overview" as const };
  }, [activeNav, courses, selectedModule]);

  const handleTrackClick = (trackId: number, courseId?: number) => {
    const cid = courseId || (viewState.type === "course" ? viewState.course?.id : undefined);
    if (cid) setActiveNav(`track:${cid}:${trackId}`);
  };

  const handleBackToCourse = () => {
    if (viewState.type === "track" && viewState.course) {
      setActiveNav(`course:${viewState.course.id}`);
    } else if (viewState.type === "unit" && viewState.course) {
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

  const handleModulesLoaded = useCallback((trackId: number, mods: ModuleSummary[]) => {
    setTrackModules((prev) => {
      if (prev[trackId] === mods) return prev; // no-op if reference unchanged
      return { ...prev, [trackId]: mods };
    });
  }, []);

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw",
      overflow: "hidden", backgroundColor: "#fafafa",
    }}>
      <DashboardSidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        onCoursesLoaded={setCourses}
        onModuleNavigate={handleModuleNavigate}
        progressVersion={progressVersion}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <DashboardHeader
          activeNav={activeNav}
          searchVal={searchVal}
          onSearchChange={setSearchVal}
          onMenuClick={handleToggleSidebar}
        />
        {/* overflow:hidden here — each child view manages its own internal scroll */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          {viewState.type === "overview" && (
            <Overview
              onExploreClick={() => {
                if (courses.length > 0) setActiveNav(`course:${courses[0].id}`);
              }}
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
            />
          )}
        </main>
      </div>
    </div>
  );
}