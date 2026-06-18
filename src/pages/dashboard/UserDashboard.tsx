import { useState, useMemo, useEffect } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import Overview from "./components/Overview";
import CourseTracksView from "./components/CourseTracksView";
import TrackDetailView from "./components/TrackDetailView";
import type { Course, CourseTrack } from "../../services/types/course.types";

const STORAGE_KEY = "dashboard_active_nav";

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || "overview";
  });

  const [searchVal, setSearchVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, activeNav);
  }, [activeNav]);

  /**
   * Nav key shapes:
   *   "overview"
   *   "course:{courseId}"
   *   "track:{courseId}:{trackId}"   ← track's stable id, matches DashboardSidebar's nav keys
   */
  const viewState = useMemo(() => {
    if (activeNav === "overview") return { type: "overview" as const };

    if (activeNav.startsWith("course:")) {
      const courseId = parseInt(activeNav.replace("course:", ""), 10);
      const course = courses.find((c) => c.id === courseId);
      return { type: "course" as const, course };
    }

    if (activeNav.startsWith("track:")) {
      const [, courseIdStr, trackIdStr] = activeNav.split(":");
      const courseId = parseInt(courseIdStr, 10);
      const trackId = parseInt(trackIdStr, 10);
      const course = courses.find((c) => c.id === courseId);
      const track: CourseTrack | undefined = course?.tracks.find(
        (t) => t.id === trackId,
      );
      return { type: "track" as const, course, track };
    }

    return { type: "overview" as const };
  }, [activeNav, courses]);

  /** Navigate to a track by its (stable) id within a course. */
  const handleTrackClick = (trackId: number, courseId?: number) => {
    const cid =
      courseId ??
      (viewState.type === "course" ? viewState.course?.id : undefined);
    if (cid !== undefined) {
      setActiveNav(`track:${cid}:${trackId}`);
    }
  };

  const handleBackToCourse = () => {
    if (viewState.type === "track" && viewState.course) {
      setActiveNav(`course:${viewState.course.id}`);
    } else {
      setActiveNav("overview");
    }
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
              onTrackClick={(trackId) =>
                handleTrackClick(trackId, viewState.course?.id)
              }
            />
          )}

          {viewState.type === "track" &&
            viewState.course &&
            viewState.track && (
              <TrackDetailView
                course={viewState.course}
                track={viewState.track}
                onBack={handleBackToCourse}
              />
            )}
        </main>
      </div>
    </div>
  );
}