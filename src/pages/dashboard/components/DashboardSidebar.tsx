import { useState } from "react";
import { LayoutDashboard, BookOpen, LogOut, Menu, X } from "lucide-react";
import { getUser } from "../../../services/tokenService";
import { authService } from "../../../services/authService";
import { getRefreshToken, clearTokens } from "../../../services/tokenService";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

const coreNav = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { id: "courses", label: "All Courses", icon: <BookOpen size={20} /> },
];

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardSidebar({
  activeNav,
  onNavChange,
}: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const user = getUser();
  const displayName = user?.fullName ?? "User";
  const displayEmail = user?.email ?? "";
  const initials = getInitials(displayName);

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        width: isOpen ? "288px" : "64px",
        borderRight: "1px solid #e0e0e0",
        minHeight: "100vh",
        height: "100%",
        overflow: "hidden",
        transition: "width 0.25s ease",
        flexShrink: 0,
      }}
      className="flex flex-col z-20"
    >
      {/* Brand + toggle */}
      <div
        className="h-16 flex items-center shrink-0 px-4"
        style={{
          borderBottom: "1px solid #e0e0e0",
          justifyContent: isOpen ? "space-between" : "center",
        }}
      >
        {isOpen && (
          <span className="font-headline font-800 text-xl tracking-tight text-primary-500 whitespace-nowrap">
            SLAN <span className="text-tertiary-500">Online</span>
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md transition-colors duration-200 shrink-0"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "rgba(0,100,0,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent";
          }}
        >
          {isOpen ? (
            <X size={20} style={{ color: "#006400" }} />
          ) : (
            <Menu size={20} style={{ color: "#006400" }} />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto pt-2">
        {coreNav.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              title={!isOpen ? item.label : undefined}
              className="w-full flex items-center py-3.5 text-[15px] font-semibold capitalize tracking-wide transition-all duration-150 text-left mb-1"
              style={{
                backgroundColor: isActive
                  ? "rgba(0,100,0,0.07)"
                  : "transparent",
                color: isActive ? "#006400" : "rgba(0,100,0,0.45)",
                borderLeft: isActive
                  ? "3px solid #101b37"
                  : "3px solid transparent",
                paddingLeft: isOpen ? (isActive ? "21px" : "24px") : "0px",
                paddingRight: isOpen ? "24px" : "0px",
                justifyContent: isOpen ? "flex-start" : "center",
                gap: isOpen ? "12px" : "0px",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "rgba(0,100,0,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#006400";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(0,100,0,0.45)";
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div
        className="shrink-0"
        style={{
          borderTop: "1px solid #e0e0e0",
          padding: isOpen ? "16px 20px" : "12px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "flex-start" : "center",
          gap: "12px",
        }}
      >
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
        {isOpen && (
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
        )}
      </div>

      {/* Logout */}
      <div
        className="p-2 shrink-0"
        style={{ borderTop: "1px solid #e0e0e0", backgroundColor: "#f5f5f5" }}
      >
        <button
          title={!isOpen ? "Logout" : undefined}
          className="flex items-center w-full py-2 rounded-md transition-colors duration-200 text-sm font-medium"
          style={{
            color: "#101b37",
            gap: "12px",
            justifyContent: isOpen ? "flex-start" : "center",
            paddingLeft: isOpen ? "16px" : "0px",
            paddingRight: isOpen ? "16px" : "0px",
          }}
          // update the logout button onClick:
          onClick={async () => {
            try {
              const refreshToken = getRefreshToken();
              if (refreshToken) await authService.logout({ refreshToken });
            } catch {
              // logout failed — clear tokens anyway
            }
            clearTokens();
            window.location.href = "/login";
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#e8eaf0";
            (e.currentTarget as HTMLButtonElement).style.color = "#101b37";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#101b37";
          }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
