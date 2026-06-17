import { useEffect, useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import { enrollmentService } from "../../services/enrollmentservice";

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchVal, setSearchVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);

  useEffect(() => {
    enrollmentService
      .getMyEnrollments()
      .then((list) => {
        const enrolled = list.length > 0;
        setIsEnrolled(enrolled);

        // Check for a post-enroll intent stored by CourseDetailOverlay
        const storedNav = sessionStorage.getItem("dashboardNav");
        if (storedNav) {
          sessionStorage.removeItem("dashboardNav");
          if (storedNav === "courses" && enrolled) {
            setActiveNav("courses");
            return;
          }
        }

        // Check URL param (e.g. from OtpPage postLoginIntent redirect)
        const urlNav = new URLSearchParams(window.location.search).get("nav");
        if (urlNav === "courses" && enrolled) {
          setActiveNav("courses");
          return;
        }

        // Default
        const fallback = urlNav || "overview";
        setActiveNav(fallback);
      })
      .catch(() => setIsEnrolled(false))
      .finally(() => setEnrollmentChecked(true));
  }, []);

  const effectiveNav =
    enrollmentChecked && activeNav === "courses" && !isEnrolled
      ? "overview"
      : activeNav;

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
        activeNav={effectiveNav}
        onNavChange={setActiveNav}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        isEnrolled={isEnrolled}
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
          activeNav={effectiveNav}
          searchVal={searchVal}
          onSearchChange={setSearchVal}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {/* overview content goes here */}
          {/* once course content exists, gate it the same way: only render if isEnrolled */}
        </main>
      </div>
    </div>
  );
}