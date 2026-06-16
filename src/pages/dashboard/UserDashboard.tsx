import { useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchVal, setSearchVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <DashboardHeader
  activeNav={activeNav}
  searchVal={searchVal}
  onSearchChange={setSearchVal}
/>

        {/* Main content area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {/* overview content goes here */}
        </main>
      </div>
    </div>
  );
}