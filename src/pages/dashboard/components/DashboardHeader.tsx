import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, User, Settings, LogOut } from "lucide-react";
import { getUser, getRefreshToken, clearTokens } from "../../../services/tokenService";
import { authService } from "../../../services/authService";

interface DashboardHeaderProps {
  activeNav: string;
  searchVal: string;
  onSearchChange: (val: string) => void;
  onMenuClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

function getInitials(fullName: string): string {
  if (!fullName || typeof fullName !== "string") return "U";
  return fullName
    .split(" ")
    .filter((n) => n.length > 0)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function DashboardHeader({
  searchVal,
  onSearchChange,
  onMenuClick,
  onProfileClick,
  onSettingsClick,
}: DashboardHeaderProps) {
  const [user, setUserState] = useState(getUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStorageChange = () => setUserState(getUser());
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const current = getUser();
      setUserState((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(current)) return current;
        return prev;
      });
    }, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    setIsLoggingOut(true);
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
    } catch {
      // Even if the server call fails, still clear the local session below.
    } finally {
      clearTokens();
      window.location.href = "/login";
    }
  };

  const initials = user?.fullName ? getInitials(user.fullName) : "U";

  return (
    <header
      className="shrink-0 bg-white flex items-center justify-between px-4 z-10"
      style={{ height: "64px", borderBottom: "1px solid #e0e0e0" }}
    >
      {/* Left: hamburger (mobile only) */}
      <div className="flex items-center shrink-0" style={{ minWidth: "40px" }}>
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{ width: "36px", height: "36px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Center: search */}
      <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto w-full">
        <div className="relative w-full">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#b0b0b0" }}
          />
          <input
            type="text"
            placeholder="Search tracks, modules, units..."
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs font-body transition-all outline-none"
            style={{
              backgroundColor: "#f5f5f5",
              border: "1px solid #e8e8e8",
              borderRadius: "9999px",
              paddingLeft: "36px",
              paddingRight: "16px",
              paddingTop: "8px",
              paddingBottom: "8px",
              color: "#444444",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1px solid #006400";
              e.currentTarget.style.backgroundColor = "#ffffff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid #e8e8e8";
              e.currentTarget.style.backgroundColor = "#f5f5f5";
            }}
          />
        </div>
      </div>

      {/* Right: bell + initials */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="relative flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{ width: "36px", height: "36px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
        >
          <Bell size={18} />
          <span
            className="absolute"
            style={{ top: "8px", right: "8px", width: "7px", height: "7px", backgroundColor: "#d4af37", borderRadius: "50%", border: "1.5px solid white" }}
          />
        </button>

        <div ref={menuRef} className="relative">
          <button
            title={user?.fullName || "User"}
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            style={{
              width: "40px", height: "40px", minWidth: "36px", borderRadius: "50%",
              backgroundColor: "#1e2e55", color: "#c0c6d8",
              fontSize: "12px", fontWeight: "700",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", letterSpacing: "0.3px",
              border: isMenuOpen ? "2px solid #006400" : "2px solid transparent",
              padding: 0,
            }}
          >
            {initials}
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 z-20"
              style={{
                width: "220px",
                backgroundColor: "#ffffff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #eeeeee",
                }}
              >
                <div
                  className="font-body"
                  style={{ fontSize: "13px", fontWeight: 600, color: "#222222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {user?.fullName || "User"}
                </div>
                {user?.email && (
                  <div
                    className="font-body"
                    style={{ fontSize: "11px", color: "#888888", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {user.email}
                  </div>
                )}
              </div>

              <button
                role="menuitem"
                onClick={() => { setIsMenuOpen(false); onProfileClick?.(); }}
                className="w-full flex items-center gap-2.5 font-body transition-colors duration-150"
                style={{ padding: "10px 14px", fontSize: "13px", color: "#333333", backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                <User size={15} style={{ color: "#888888" }} />
                Profile
              </button>

              <button
                role="menuitem"
                onClick={() => { setIsMenuOpen(false); onSettingsClick?.(); }}
                className="w-full flex items-center gap-2.5 font-body transition-colors duration-150"
                style={{ padding: "10px 14px", fontSize: "13px", color: "#333333", backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                <Settings size={15} style={{ color: "#888888" }} />
                Settings
              </button>

              <div style={{ borderTop: "1px solid #eeeeee" }}>
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 font-body transition-colors duration-150"
                  style={{ padding: "10px 14px", fontSize: "13px", color: "#b91c1c", backgroundColor: "transparent", border: "none", cursor: isLoggingOut ? "default" : "pointer", textAlign: "left", opacity: isLoggingOut ? 0.6 : 1 }}
                  onMouseEnter={(e) => { if (!isLoggingOut) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fef2f2"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                >
                  <LogOut size={15} style={{ color: "#b91c1c" }} />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
      }
