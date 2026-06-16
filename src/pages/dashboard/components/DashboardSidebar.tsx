import { LayoutDashboard, BookOpen, LogOut } from "lucide-react";
import { getUser } from "../../../services/tokenService";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

const coreNav = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { id: "courses", label: "All Courses", icon: <BookOpen size={18} /> },
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
  const initials = user ? getInitials(user.fullName) : "??";

  return (
    <aside
      className="w-72 min-h-screen h-full flex flex-col shrink-0 z-20 shadow-lg bg-neutral-100"
     
    >
      {/* Brand */}
      <div className="h-16 px-6 pt-8 pb-6 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <h1 className="font-bold text-xl tracking-tight text-primary-500" >
          Dashboard
        </h1>
        <p className="text-[11px] uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {coreNav.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: isActive ? "#d4af37" : "rgba(255,255,255,0.65)",
                borderLeft: isActive ? "2px solid #d4af37" : "2px solid transparent",
                paddingLeft: isActive ? "14px" : "16px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.1)";
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
      <div className="px-4 py-5 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
            style={{ backgroundColor: "#d4af37", color: "#7a5f00", fontSize: "13px" }}
          >
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate leading-tight" style={{ color: "#ffffff" }}>
              {user?.fullName ?? "—"}
            </p>
            <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {user?.email ?? "—"}
            </p>
          </div>
        </div>

        <button
          className="w-full flex items-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all duration-200"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}