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
    <aside
      style={{ backgroundColor: "#268d26", width: "180px" }}
      className="min-h-screen h-full flex flex-col shrink-0 z-20"
    >
      {/* Brand */}
      <div
        className="px-5 pt-6 pb-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
      >
        <h1 className="font-bold text-base tracking-tight" style={{ color: "#ffffff" }}>
          Dashboard
        </h1>
        <p
          className="text-[10px] uppercase tracking-widest mt-0.5"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {coreNav.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 text-left"
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: isActive ? "#d4af37" : "rgba(255,255,255,0.65)",
                borderLeft: isActive ? "2px solid #d4af37" : "2px solid transparent",
                paddingLeft: isActive ? "10px" : "12px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
                }
              }}
            >
              <span style={{ color: isActive ? "#d4af37" : "rgba(255,255,255,0.5)" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Logout Footer */}
      <div
        className="px-3 py-4 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
      >
        {/* Initials avatar */}
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0"
            style={{
              backgroundColor: "#d4af37",
              color: "#7a5f00",
              fontSize: "11px",
              letterSpacing: "0.3px",
            }}
          >
            {initials}
          </div>
          <div className="overflow-hidden">
            <p
              className="text-[12px] font-semibold truncate leading-tight"
              style={{ color: "#ffffff" }}
            >
              {displayName}
            </p>
            <p
              className="text-[10px] truncate mt-0.5 leading-tight"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {displayEmail}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          className="w-full flex items-center gap-2 py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all duration-200"
          style={{ color: "rgba(255,255,255,0.45)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </aside>
  );
}