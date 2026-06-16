import { useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState("overview");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50">
      <DashboardSidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* blank for now */}
      </div>
    </div>
  );
}