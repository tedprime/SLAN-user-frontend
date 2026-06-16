import { LayoutDashboard, BookOpen, LogOut } from "lucide-react";
import { getUser } from "../../../services/tokenService";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

const coreNav = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
  { id: "courses", label: "All Courses", icon: <BookOpen size={15} /> },
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
      style={{ backgroundColor: "#f5f5f5", width: "288px", borderRight: "1px solid #e0e0e0" }}
      className="min-h-screen h-full flex flex-col shrink-0 z-20"
    >
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 shrink-0">
        <h1 className="font-bold text-xl tracking-tight" style={{ color: "#006400" }}>
          SLAN Online
        </h1>
        <p
          className="text-[10px] uppercase tracking-widest mt-1 font-semibold"
          style={{ color: "rgba(0,100,0,0.4)" }}
        >
          School Leadership Academy
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto">
        {coreNav.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="w-full flex items-center gap-3 py-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-150 text-left"
              style={{
                backgroundColor: isActive ? "rgba(0,100,0,0.07)" : "transparent",
                color: isActive ? "#006400" : "rgba(0,100,0,0.45)",
                borderLeft: isActive ? "3px solid #006400" : "3px solid transparent",
                paddingLeft: isActive ? "21px" : "24px",
                paddingRight: "24px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#006400";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,100,0,0.45)";
                }
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Logout Footer */}
      <div
        className="px-5 py-5 shrink-0"
        style={{ borderTop: "1px solid #e0e0e0" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
            style={{
              backgroundColor: "#d4af37",
              color: "#7a5f00",
              fontSize: "12px",
            }}
          >
            {initials}
          </div>
          <div className="overflow-hidden">
            <p
              className="text-[13px] font-bold truncate leading-tight"
              style={{ color: "#006400" }}
            >
              {displayName}
            </p>
            <p
              className="text-[11px] truncate mt-0.5"
              style={{ color: "rgba(0,100,0,0.5)" }}
            >
              {displayEmail}
            </p>
          </div>
        </div>

        <button
          className="w-full flex items-center gap-2 py-1.5 px-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-150"
          style={{ color: "rgba(0,100,0,0.4)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#006400";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,100,0,0.4)";
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