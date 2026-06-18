import { useState, useMemo, useEffect } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import CourseTracksView from "./components/CourseTracksView";
import TrackDetailView from "./components/TrackDetailView";
import type { Course } from "../../services/types/course.types";

const STORAGE_KEY = "dashboard_active_nav";

export default function UserDashboard() {
  // Restore from sessionStorage on mount, default to "overview"
  const [activeNav, setActiveNav] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || "overview";
  });
  
  const [searchVal, setSearchVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  // Persist activeNav to sessionStorage whenever it changes
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
    return { type: "overview" as const };
  }, [activeNav, courses]);

  const handleTrackClick = (trackId: number) => {
    if (viewState.type === "course" && viewState.course) {
      setActiveNav(`track:${viewState.course.id}:${trackId}`);
    }
  };

  const handleBackToCourse = () => {
    if (viewState.type === "track" && viewState.course) {
      setActiveNav(`course:${viewState.course.id}`);
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
            <div style={{ padding: "32px" }}>
              <h2 style={{ color: "#101b37", fontFamily: "var(--font-headline)" }}>
                Overview
              </h2>
              <p style={{ color: "#888888" }}>Select a course from the sidebar to view tracks.</p>
            </div>
          )}

          {viewState.type === "course" && viewState.course && (
            <CourseTracksView
              course={viewState.course}
              onTrackClick={handleTrackClick}
            />
          )}

          {viewState.type === "track" && viewState.course && viewState.track && (
            <TrackDetailView
              course={viewState.course}
              track={viewState.track}
              onBack={handleBackToCourse}
              onModuleClick={handleModuleClick}
            />
          )}
        </main>
      </div>
    </div>
  );
}