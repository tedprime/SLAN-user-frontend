import { Bell, Search } from "lucide-react";

const PAGE_LABELS: Record<string, string> = {
  overview: "Overview",
  courses: "All Courses",
};

interface DashboardHeaderProps {
  activeNav: string;
  searchVal: string;
  onSearchChange: (val: string) => void;
}

export default function DashboardHeader({
  activeNav, searchVal, onSearchChange,
}: DashboardHeaderProps) {
  const label = activeNav.startsWith("track-")
    ? `Track ${activeNav.replace("track-", "")}`
    : PAGE_LABELS[activeNav] ?? activeNav;

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="font-headline font-bold text-base text-neutral-800">{label}</h2>
        <div className="h-4 w-px bg-neutral-200" />
        <span className="text-xs font-label font-700 text-neutral-400 uppercase tracking-wider">
          2026 Cohort
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-lg text-xs font-body text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 w-52 transition-all"
          />
        </div>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}