import { LayoutDashboard, BookOpen, LogOut, Menu, X } from "lucide-react";
import { authService } from "../../../services/authService";
import { getRefreshToken, clearTokens } from "../../../services/tokenService";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const coreNav = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { id: "courses", label: "Course", icon: <BookOpen size={20} /> },
];

export default function DashboardSidebar({
  activeNav,
  onNavChange,
  isOpen,
  onToggle,
}: DashboardSidebarProps) {
  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        width: isOpen ? "288px" : "64px",
        borderRight: "1px solid #e0e0e0",
        height: "100vh",
        overflow: "hidden",
        transition: "width 0.25s ease",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
      }}
    >
      {/* Brand + toggle — same height as header (64px) */}
      <div
        style={{
          height: "64px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          paddingLeft: isOpen ? "20px" : "0",
          paddingRight: isOpen ? "12px" : "0",
          flexShrink: 0,
        }}
      >
        {isOpen && (
          <span className="font-headline font-800 text-xl tracking-tight text-primary-500 whitespace-nowrap">
            SLAN <span className="text-tertiary-500">Online</span>
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            padding: "6px",
            borderRadius: "6px",
            transition: "background-color 0.2s",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          {isOpen
            ? <X size={20} style={{ color: "#006400" }} />
            : <Menu size={20} style={{ color: "#006400" }} />
          }
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", paddingTop: "8px" }}>
        {coreNav.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              title={!isOpen ? item.label : undefined}
              className="w-full flex items-center text-left mb-1"
              style={{
                padding: "14px 0",
                fontSize: "15px",
                fontWeight: 600,
                textTransform: "capitalize",
                letterSpacing: "0.02em",
                transition: "all 0.15s",
                backgroundColor: isActive ? "rgba(0,100,0,0.07)" : "transparent",
                color: isActive ? "#006400" : "rgba(0,100,0,0.45)",
                borderLeft: isActive ? "3px solid #101b37" : "3px solid transparent",
                paddingLeft: isOpen ? (isActive ? "21px" : "24px") : "0px",
                paddingRight: isOpen ? "24px" : "0px",
                justifyContent: isOpen ? "flex-start" : "center",
                gap: isOpen ? "12px" : "0px",
                whiteSpace: "nowrap",
                border: "none",
                cursor: "pointer",
                borderLeftWidth: "3px",
                borderLeftStyle: "solid",
                borderLeftColor: isActive ? "#101b37" : "transparent",
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
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout — pinned to bottom */}
      <div
        style={{
          padding: "8px",
          flexShrink: 0,
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#f5f5f5",
        }}
      >
        <button
          title={!isOpen ? "Logout" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "8px 0",
            borderRadius: "6px",
            transition: "all 0.2s",
            fontSize: "14px",
            fontWeight: 500,
            color: "#101b37",
            gap: "12px",
            justifyContent: isOpen ? "flex-start" : "center",
            paddingLeft: isOpen ? "16px" : "0px",
            paddingRight: isOpen ? "16px" : "0px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
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
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#e8eaf0";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}