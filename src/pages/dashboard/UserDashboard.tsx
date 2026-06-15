import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  Search,
  LogOut,
  CheckCircle2,
  Clock,
  ChevronRight,
  Landmark,
  Building2,
  Users,
  BarChart3,
  Link2,
  GraduationCap,
  PlayCircle,
  Award,
  TrendingUp,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type NavItem = { id: string; label: string; icon: React.ReactNode };
type Track = {
  number: number;
  icon: React.ReactNode;
  title: string;
  modules: number;
  units: number;
  progress: number; // 0–100
  status: "completed" | "in-progress" | "locked";
};

// ── Data ─────────────────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { id: "courses", label: "Courses", icon: <BookOpen size={18} /> },
];

const tracks: Track[] = [
  {
    number: 1,
    icon: <Landmark size={18} />,
    title: "Foundational Leadership",
    modules: 3,
    units: 15,
    progress: 100,
    status: "completed",
  },
  {
    number: 2,
    icon: <BookOpen size={18} />,
    title: "Academic & Instructional Leadership",
    modules: 3,
    units: 15,
    progress: 60,
    status: "in-progress",
  },
  {
    number: 3,
    icon: <Building2 size={18} />,
    title: "School Administration & Operations",
    modules: 3,
    units: 15,
    progress: 0,
    status: "locked",
  },
  {
    number: 4,
    icon: <Users size={18} />,
    title: "People, Culture & Community",
    modules: 3,
    units: 15,
    progress: 0,
    status: "locked",
  },
  {
    number: 5,
    icon: <BarChart3 size={18} />,
    title: "Safety, Crisis & Environment",
    modules: 3,
    units: 15,
    progress: 0,
    status: "locked",
  },
  {
    number: 6,
    icon: <Link2 size={18} />,
    title: "Technology & Innovation",
    modules: 3,
    units: 15,
    progress: 0,
    status: "locked",
  },
  {
    number: 7,
    icon: <GraduationCap size={18} />,
    title: "Private School Leadership",
    modules: 3,
    units: 15,
    progress: 0,
    status: "locked",
  },
];

const recentActivity = [
  { label: "Completed Unit 9 — Strategic Vision & School Culture", time: "2 hours ago", done: true },
  { label: "Passed Module 1 Assessment — Score: 88%", time: "Yesterday", done: true },
  { label: "Started Unit 10 — Community-Led School Improvement", time: "Today", done: false },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  sub,
  accent = false,
}: {
  value: string;
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border flex flex-col gap-1 shadow-card ${
        accent
          ? "bg-primary-500 border-primary-600 text-white"
          : "bg-white border-neutral-200 text-neutral-800"
      }`}
    >
      <span
        className={`font-headline font-bold text-2xl ${
          accent ? "text-white" : "text-tertiary-500"
        }`}
      >
        {value}
      </span>
      <span
        className={`text-sm font-semibold font-body ${
          accent ? "text-white/90" : "text-neutral-700"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-xs font-body ${
          accent ? "text-white/60" : "text-neutral-400"
        }`}
      >
        {sub}
      </span>
    </div>
  );
}

function TrackRow({ track }: { track: Track }) {
  const isLocked = track.status === "locked";
  const isDone = track.status === "completed";

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group ${
        isLocked
          ? "bg-neutral-50 border-neutral-100 opacity-50 cursor-not-allowed"
          : "bg-white border-neutral-200 hover:border-primary-300 hover:shadow-card cursor-pointer"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
          isDone
            ? "bg-primary-500 text-white"
            : isLocked
            ? "bg-neutral-200 text-neutral-400"
            : "bg-primary-50 text-primary-500 group-hover:bg-primary-500 group-hover:text-white"
        }`}
      >
        {track.icon}
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-label font-700 text-neutral-400 uppercase tracking-wider">
            Track {track.number}
          </span>
          {isDone && (
            <span className="inline-flex items-center gap-1 text-[10px] font-700 font-label text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <CheckCircle2 size={10} /> Completed
            </span>
          )}
          {track.status === "in-progress" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-700 font-label text-secondary-700 bg-secondary-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <PlayCircle size={10} /> In Progress
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-neutral-800 font-body truncate">
          {track.title}
        </p>
        {/* Progress bar */}
        {!isLocked && (
          <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${track.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Right meta */}
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <span className="text-xs font-body text-neutral-500">
          {track.modules} modules · {track.units} units
        </span>
        {!isLocked && (
          <span className="text-xs font-700 font-label text-primary-500">
            {track.progress}%
          </span>
        )}
        {!isLocked && <ChevronRight size={14} className="text-neutral-300 mt-0.5" />}
      </div>
    </div>
  );
}

// ── Views ─────────────────────────────────────────────────────────────────────

function OverviewView() {
  return (
    <div className="space-y-8 max-w-5xl animate-fade-in-up">
      {/* Welcome banner */}
      <div className="bg-primary-500 rounded-2xl p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-cta">
        <div
          className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(30%, -30%)" }}
        />
        <div className="absolute bottom-0 right-32 w-40 h-40 rounded-full bg-white/5" />
        <div className="space-y-1.5 max-w-lg relative z-10">
          <p className="text-xs font-label font-700 tracking-widest uppercase text-white/60">
            National Leadership Initiative · 2026 Cohort
          </p>
          <h2 className="font-headline font-bold text-2xl text-white leading-snug">
            Welcome back, Olumide.
          </h2>
          <p className="font-body text-sm text-white/75 leading-relaxed">
            You're 60% through Track 2. Complete Unit 10 to unlock your next module assessment.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 rounded-xl text-center shrink-0 relative z-10">
          <div className="text-3xl font-bold font-headline text-secondary-300">2 / 7</div>
          <div className="text-[10px] uppercase tracking-wider text-white/80 font-700 mt-1">
            Tracks Active
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="09" label="Units Completed" sub="of 105 total" />
        <StatCard value="88%" label="Last Assessment" sub="Module 1 · Track 2" accent />
        <StatCard value="14h" label="Learning Hours" sub="this month" />
        <StatCard value="1" label="Certificates Earned" sub="Track 1 complete" />
      </div>

      {/* Two-col: continue learning + recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Continue learning */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-base text-neutral-800">
              Continue Learning
            </h3>
            <TrendingUp size={16} className="text-primary-500" />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-label font-700 uppercase tracking-wider text-neutral-400">
              Track 2 · Module 2 · Unit 10
            </p>
            <p className="text-sm font-semibold text-neutral-800 font-body leading-snug">
              Community-Led School Improvement Frameworks
            </p>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: "60%" }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400 font-body">60% complete</span>
              <button className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-dark text-white text-xs font-700 font-label px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-cta">
                <PlayCircle size={13} /> Resume Unit
              </button>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-base text-neutral-800">
              Recent Activity
            </h3>
            <Clock size={16} className="text-neutral-400" />
          </div>
          <ul className="space-y-4">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    item.done ? "bg-primary-50 text-primary-500" : "bg-secondary-50 text-secondary-700"
                  }`}
                >
                  {item.done ? <CheckCircle2 size={12} /> : <PlayCircle size={12} />}
                </div>
                <div>
                  <p className="text-xs font-body text-neutral-700 leading-snug">{item.label}</p>
                  <p className="text-[10px] text-neutral-400 font-body mt-0.5">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Certificate earned */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-secondary-500 flex items-center justify-center shrink-0">
          <Award size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-label font-700 text-secondary-700 uppercase tracking-wider mb-0.5">
            Certificate Earned
          </p>
          <p className="text-sm font-semibold text-neutral-800 font-body">
            Track 1 · Foundational Leadership — Certificate of Completion
          </p>
        </div>
        <button className="shrink-0 text-xs font-700 font-label text-secondary-700 border border-secondary-300 px-4 py-2 rounded-lg hover:bg-secondary-100 transition-all duration-200">
          Download PDF
        </button>
      </div>
    </div>
  );
}

function CoursesView() {
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed" | "locked">("all");

  const filtered =
    filter === "all" ? tracks : tracks.filter((t) => t.status === filter);

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="font-headline font-bold text-2xl text-neutral-800">
          Seven Tracks of Excellence
        </h2>
        <p className="text-sm font-body text-neutral-500 mt-1">
          21 Modules · 105 Units · One complete leadership transformation
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
        {(["all", "in-progress", "completed", "locked"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-700 font-label transition-all duration-200 capitalize ${
              filter === f
                ? "bg-white text-primary-500 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-card">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-label font-700 text-neutral-500 uppercase tracking-wider">
            Programme Progress
          </span>
          <span className="text-xs font-700 font-label text-primary-500 bg-primary-50 px-2.5 py-1 rounded-md">
            1 of 7 Tracks Complete
          </span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: "22%",
              background: "linear-gradient(90deg, #006400, #1a7a1a)",
            }}
          />
        </div>
        <div className="flex mt-3 gap-1">
          {tracks.map((t) => (
            <div
              key={t.number}
              title={`Track ${t.number}`}
              className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{
                background:
                  t.status === "completed"
                    ? "#006400"
                    : t.status === "in-progress"
                    ? "#d4af37"
                    : "#e8e8e8",
              }}
            />
          ))}
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-3">
        {filtered.map((track) => (
          <TrackRow key={track.number} track={track} />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchVal, setSearchVal] = useState("");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral text-tertiary-500">

      {/* ── GREEN SIDEBAR ───────────────────────────────────────── */}
      <aside className="w-[260px] h-full flex flex-col bg-primary-500 shrink-0 z-20">

        {/* Brand */}
        <div className="px-6 pt-8 pb-6">
          <h1 className="font-headline font-bold text-xl text-white tracking-tight">
            SLAN <span className="text-secondary-300">Online</span>
          </h1>
          <p className="text-[10px] font-label font-700 uppercase tracking-widest text-white/40 mt-1">
            School Leadership Academy
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-700 font-label transition-all duration-200 text-left ${
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
        </nav>

        {/* Profile + logout */}
        <div className="px-4 py-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-secondary-300 flex items-center justify-center font-bold text-sm text-secondary-800 shrink-0 font-headline">
              OO
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-700 font-label text-white truncate">Olumide O.</p>
              <p className="text-[11px] font-body text-white/45 truncate">School Principal</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-700 font-label text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-headline font-bold text-base text-neutral-800 capitalize">
              {activeNav}
            </h2>
            <div className="h-4 w-px bg-neutral-200" />
            <span className="text-xs font-label font-700 text-neutral-400 uppercase tracking-wider">
              2026 Cohort
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-lg text-xs font-body text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 w-52 transition-all"
              />
            </div>
            {/* Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeNav === "overview" && <OverviewView />}
          {activeNav === "courses" && <CoursesView />}
        </main>
      </div>
    </div>
  );
}