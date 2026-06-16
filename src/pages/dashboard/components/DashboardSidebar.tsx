import { useState } from "react";
import { LayoutDashboard, BookOpen, LogOut, Menu, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(true);
  const user = getUser();
  const displayName = user?.fullName ?? "User";
  const displayEmail = user?.email ?? "";
  const initials = getInitials(displayName);

  return (
    <>
      {/* Hamburger — visible only when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md transition-colors duration-200"
          style={{ backgroundColor: "#f5f5f5", border: "1px solid #e0e0e0" }}
        >
          <Menu size={20} style={{ color: "#006400" }} />
        </button>
      )}

      {/* Sidebar */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          width: isOpen ? "288px" : "0px",
          borderRight: isOpen ? "1px solid #e0e0e0" : "none",
          minHeight: "100vh",
          height: "100%",
          overflow: "hidden",
          transition: "width 0.25s ease",
          flexShrink: 0,
        }}
        className="flex flex-col z-20"
      >
        {/* Brand + X toggle */}
        <div
          className="px-6 h-16 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid #e0e0e0" }}
        >
          <span className="font-headline font-800 text-xl tracking-tight text-primary-500">
            SLAN <span className="text-tertiary-500">Online</span>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md transition-colors duration-200"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
          >
            <X size={20} style={{ color: "#006400" }} />
          </button>
        </div>

        {/* Nav — scrollable */}
        <nav className="flex-1 overflow-y-auto pt-2">
          {coreNav.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className="w-full flex items-center gap-3 py-3.5 text-[15px] font-semibold capitalize tracking-wide transition-all duration-150 text-left mb-1"
                style={{
                  backgroundColor: isActive ? "rgba(0,100,0,0.07)" : "transparent",
                  color: isActive ? "#006400" : "rgba(0,100,0,0.45)",
                  borderLeft: isActive ? "3px solid #101b37" : "3px solid transparent",
                  paddingLeft: isActive ? "21px" : "24px",
                  paddingRight: "24px",
                  whiteSpace: "nowrap",
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

        {/* User info */}
        <div
          className="px-5 py-4 shrink-0"
          style={{ borderTop: "1px solid #e0e0e0" }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: "#1e2e55",
                color: "#c0c6d8",
                fontSize: "12px",
                fontWeight: "700",
                width: "36px",
                height: "36px",
                minWidth: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
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
        </div>

        {/* Logout */}
        <div
          className="p-2 shrink-0"
          style={{ borderTop: "1px solid #e0e0e0", backgroundColor: "#f5f5f5" }}
        >
          <button
            className="flex items-center w-full py-2 px-4 rounded-md transition-colors duration-200 text-sm font-medium"
            style={{ color: "#101b37", gap: "12px" }}
            onClick={() => {
              window.history.pushState({}, "", "/login");
              window.dispatchEvent(new Event("popstate"));
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#e8eaf0";
              (e.currentTarget as HTMLButtonElement).style.color = "#101b37";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#101b37";
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}