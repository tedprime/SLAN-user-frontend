import { Bell, Search } from "lucide-react";
import { getUser } from "../../../services/tokenService";

interface DashboardHeaderProps {
  activeNav: string;
  searchVal: string;
  onSearchChange: (val: string) => void;
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function DashboardHeader({
  searchVal,
  onSearchChange,
}: DashboardHeaderProps) {
  const user = getUser();
  const initials = user?.fullName ? getInitials(user.fullName) : "U";

  return (
    <header
      className="shrink-0 bg-white flex items-center justify-between px-6 z-10"
      style={{
        height: "64px",
        borderBottom: "1px solid #e0e0e0",
      }}
    >

      {/* Center: search */}
      <div className="flex-1 flex justify-center px-8 max-w-xl mx-auto w-full">
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

      {/* Right: bell + initials avatar */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Bell */}
        <button
          className="relative flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{
            width: "36px",
            height: "36px",
            color: "#888888",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5";
            (e.currentTarget as HTMLButtonElement).style.color = "#006400";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#888888";
          }}
        >
          <Bell size={18} />
          <span
            className="absolute"
            style={{
              top: "8px",
              right: "8px",
              width: "7px",
              height: "7px",
              backgroundColor: "#d4af37",
              borderRadius: "50%",
              border: "1.5px solid white",
            }}
          />
        </button>

        {/* Initials avatar */}
        <div
          style={{
            width: "40px",
            height: "40px",
            minWidth: "36px",
            borderRadius: "50%",
            backgroundColor: "#1e2e55",
            color: "#c0c6d8",
            fontSize: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            letterSpacing: "0.3px",
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}