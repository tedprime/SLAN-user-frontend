import { useEffect, useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import { enrollmentService } from "../../services/enrollmentservice";

export default function UserDashboard() {
  const initialNav =
    new URLSearchParams(window.location.search).get("nav") || "overview";

  const [activeNav, setActiveNav] = useState(initialNav);
  const [searchVal, setSearchVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);

  useEffect(() => {
    enrollmentService
      .getMyEnrollments()
      .then((list) => setIsEnrolled(list.length > 0))
      .catch(() => setIsEnrolled(false))
      .finally(() => setEnrollmentChecked(true));
  }, []);

  // Derived, not stored: if we ended up on "courses" but the enrollment
  // check says we shouldn't be there, treat "overview" as active for this
  // render. No second effect/state needed for what's a pure derivation.
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

        {/* Main content area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {/* overview content goes here */}
          {/* once course content exists, gate it the same way: only render if isEnrolled */}
        </main>
      </div>
    </div>
  );
}
