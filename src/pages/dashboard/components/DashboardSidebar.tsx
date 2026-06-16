import { LayoutDashboard, BookOpen, LogOut } from "lucide-react";
import { getUser } from "../../../services/tokenService";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

const coreNav = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "courses", label: "All Courses", icon: <BookOpen size={16} /> },
];

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardSidebar({ activeNav, onNavChange }: DashboardSidebarProps) {
  const user = getUser();
  const displayName = user?.fullName ?? "User";
  const displayEmail = user?.email ?? "";
  const initials = getInitials(displayName);

  return (
    <div
      style={{ backgroundColor: "#f5f5f5", width: "288px" }}
      className="min-h-screen h-full flex flex-col shrink-0 z-20"
    >
      {/* Brand */}
      <div
        className="px-6 pt-6 pb-5 shrink-0"
        style={{ borderBottom: "1px solid #e0e0e0" }}
      >
        <h1 className="font-bold text-base tracking-tight" style={{ color: "#006400" }}>
          Dashboard
        </h1>
        <p
          className="text-[10px] uppercase tracking-widest mt-0.5"
          style={{ color: "#006400", opacity: 0.5 }}
        >
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {coreNav.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 text-left"
              style={{
                backgroundColor: isActive ? "rgba(0,100,0,0.1)" : "transparent",
                color: isActive ? "#006400" : "rgba(0,100,0,0.55)",
                borderLeft: isActive ? "2px solid #006400" : "2px solid transparent",
                paddingLeft: isActive ? "14px" : "16px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#006400";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,100,0,0.55)";
                }
              }}
            >
              <span style={{ color: isActive ? "#006400" : "rgba(0,100,0,0.4)" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Logout Footer */}
      <div
        className="px-4 py-4 shrink-0"
        style={{ borderTop: "1px solid #e0e0e0" }}
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0"
            style={{
              backgroundColor: "#d4af37",
              color: "#7a5f00",
              fontSize: "11px",
            }}
          >
            {initials}
          </div>
          <div className="overflow-hidden">
            <p
              className="text-[13px] font-semibold truncate leading-tight"
              style={{ color: "#006400" }}
            >
              {displayName}
            </p>
            <p
              className="text-[10px] truncate mt-0.5"
              style={{ color: "rgba(0,100,0,0.5)" }}
            >
              {displayEmail}
            </p>
          </div>
        </div>

        <button
          className="w-full flex items-center gap-2 py-1.5 px-2 text-[12px] font-medium rounded-lg transition-all duration-200"
          style={{ color: "rgba(0,100,0,0.5)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#006400";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,100,0,0.5)";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </div>
  );
}