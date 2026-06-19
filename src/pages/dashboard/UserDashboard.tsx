import { useState, useMemo, useEffect } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import Overview from "./components/Overview";
import CourseTracksView from "./components/CourseTracksView";
import TrackDetailView from "./components/TrackDetailView";
import UnitViewer from "./components/UnitDetailView";
import type { Course, ModuleSummary } from "../../services/types/course.types";

const STORAGE_KEY = "dashboard_active_nav";

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || "overview";
  });
  
  const [searchVal, setSearchVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleSummary | null>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, activeNav);
  }, [activeNav]);

  const viewState = useMemo(() => {
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
  }, [activeNav, courses]);

  const handleTrackClick = (trackId: number, courseId?: number) => {
    const cid = courseId || (viewState.type === "course" ? viewState.course?.id : undefined);
    if (cid) {
      setActiveNav(`track:${cid}:${trackId}`);
    }
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

  const handlePlayClick = (moduleId: number) => {
    // Find the module in the current track
    if (viewState.type === "track" && viewState.track) {
      // We'll need to fetch module details or pass them
      // For now, create a minimal module object
      const module: ModuleSummary = {
        id: moduleId,
        title: "Module",
        slug: "",
        description: "",
        estimatedReadMinutes: 0,
        unitCount: 0,
        totalEstimatedMinutes: 0,
      };
      setSelectedModule(module);
      setActiveNav(`unit:${viewState.course?.id}:${viewState.track.id}:${moduleId}`);
    }
  };

  const handleModuleClick = (moduleId: number) => {
    console.log("Module clicked:", moduleId);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#fafafa",
      }}
    >
      <DashboardSidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onCoursesLoaded={setCourses}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <DashboardHeader
          activeNav={activeNav}
          searchVal={searchVal}
          onSearchChange={setSearchVal}
        />
        <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {viewState.type === "overview" && (
            <Overview onTrackClick={handleTrackClick} />
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
            />
          )}

          {viewState.type === "unit" && viewState.course && viewState.track && selectedModule && (
            <UnitViewer
              courseId={viewState.course.id}
              trackId={viewState.track.id}
              module={selectedModule}
              onBack={handleBackToCourse}
            />
          )}
        </main>
      </div>
    </div>
  );
}