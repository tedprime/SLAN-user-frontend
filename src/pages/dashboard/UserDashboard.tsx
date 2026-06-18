import { useState, useMemo } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import CourseTracksView from "./components/CourseTracksView";
import type { Course } from "../../services/types/course.types";

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchVal, setSearchVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  const selectedCourse = useMemo(() => {
    if (!activeNav.startsWith("course:")) return null;
    const courseId = parseInt(activeNav.replace("course:", ""), 10);
    return courses.find((c) => c.id === courseId) || null;
  }, [activeNav, courses]);

  const handleTrackClick = (trackId: number) => {
    if (selectedCourse) {
      setActiveNav(`track:${selectedCourse.id}:${trackId}`);
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
          {selectedCourse ? (
            <CourseTracksView
              course={selectedCourse}
              onTrackClick={handleTrackClick}
            />
          ) : (
            <div style={{ padding: "32px" }}>
              <h2 style={{ color: "#101b37", fontFamily: "var(--font-headline)" }}>
                Overview
              </h2>
              <p style={{ color: "#888888" }}>Select a course from the sidebar to view tracks.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}