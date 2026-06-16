import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import type { Track } from "../index";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  enrolledTracks: Track[];
  user?: {
    name: string;
    email: string;
    initials: string;
    role: string;
  };
}

const coreNav = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { id: "courses", label: "All Courses", icon: <BookOpen size={18} /> },
];

function StatusDot({ status }: { status: Track["status"] }) {
  if (status === "completed")
    return <CheckCircle2 size={12} className="text-secondary-300 shrink-0" />;
  if (status === "in-progress")
    return (
      <PlayCircle
        size={12}
        className="text-secondary-300 shrink-0 animate-pulse"
      />
    );
  return <ChevronRight size={12} className="text-white/30 shrink-0" />;
}

export default function DashboardSidebar({
  activeNav,
  onNavChange,
  enrolledTracks,
  user = {
    name: "Olumide O.",
    email: "olumide@slan.edu.ng",
    initials: "OO",
    role: "School Principal",
  },
}: DashboardSidebarProps) {
  return (
    <aside className="w-[260px] min-h-screen h-full flex flex-col bg-primary-500 shrink-0 z-20">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6 shrink-0">
        <h1 className="font-headline font-bold text-xl text-white tracking-tight">
          SLAN <span className="text-secondary-300">Online</span>
        </h1>
        <p className="text-[10px] font-label font-700 uppercase tracking-widest text-white/40 mt-1">
          School Leadership Academy
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-1 pb-4">
        {coreNav.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-700 font-label transition-all duration-200 text-left ${
                isActive
                  ? "bg-white/15 text-white border-l-2 border-secondary-300 pl-[14px]"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-white" : "text-white/50"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}

        {/* My Courses — only when enrolled */}
        {enrolledTracks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[10px] font-label font-700 uppercase tracking-widest text-white/35 px-4 mb-2">
              My Courses
            </p>
            {enrolledTracks.map((track) => {
              const id = `track-${track.number}`;
              const isActive = activeNav === id;
              return (
                <button
                  key={track.number}
                  onClick={() => onNavChange(id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                    isActive
                      ? "bg-white/15 text-white border-l-2 border-secondary-300 pl-[14px]"
                      : "text-white/55 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-white/40 group-hover:text-white/70"}`}
                  >
                    {track.icon}
                  </span>
                  <span className="flex-1 text-xs font-700 font-label leading-snug truncate">
                    {track.title}
                  </span>
                  <StatusDot status={track.status} />
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* User + Logout Footer */}
      <div className="px-4 py-5 border-t border-white/10 shrink-0">
        {/* User info row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-secondary-300 flex items-center justify-center font-bold text-sm text-secondary-800 shrink-0 font-headline">
            {user.initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-700 font-label text-white truncate leading-tight">
              {user.name}
            </p>
            <p className="text-[11px] font-body text-white/45 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button className="w-full flex items-center gap-2 py-2 px-3 text-xs font-700 font-label text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}