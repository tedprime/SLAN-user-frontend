import { Award, Clock, PlayCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import StatCard from "./StatCard";
import type { Track } from "../index";
import { recentActivity } from "../data";

interface OverviewViewProps {
  enrolledTracks: Track[];
}

export default function OverviewView({ enrolledTracks }: OverviewViewProps) {
  const activeCount    = enrolledTracks.filter((t) => t.status !== "locked").length;
  const inProgressTrack = enrolledTracks.find((t) => t.status === "in-progress");
  const isEnrolled     = enrolledTracks.length > 0;

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in-up">

      {/* Welcome banner */}
      <div className="bg-primary-500 rounded-2xl p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-cta">
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 right-32 w-40 h-40 rounded-full bg-white/5" />

        <div className="space-y-1.5 max-w-lg relative z-10">
          <p className="text-xs font-label font-700 tracking-widest uppercase text-white/60">
            National Leadership Initiative · 2026 Cohort
          </p>
          <h2 className="font-headline font-bold text-2xl text-white leading-snug">
            Welcome back, Olumide.
          </h2>
          <p className="font-body text-sm text-white/75 leading-relaxed">
            {isEnrolled
              ? inProgressTrack
                ? `You're ${inProgressTrack.progress}% through Track ${inProgressTrack.number}. Keep going!`
                : "You have completed all your active tracks. Explore more courses."
              : "You haven't enrolled in any courses yet. Browse the catalogue below."}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 rounded-xl text-center shrink-0 relative z-10">
          <div className="text-3xl font-bold font-headline text-secondary-300">{activeCount} / 7</div>
          <div className="text-[10px] uppercase tracking-wider text-white/80 font-700 mt-1">Tracks Active</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="09"  label="Units Completed"    sub="of 105 total" />
        <StatCard value="88%" label="Last Assessment"    sub="Module 1 · Track 2" accent />
        <StatCard value="14h" label="Learning Hours"     sub="this month" />
        <StatCard value="1"   label="Certificates Earned" sub="Track 1 complete" />
      </div>

      {isEnrolled ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Continue learning */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base text-neutral-800">Continue Learning</h3>
              <TrendingUp size={16} className="text-primary-500" />
            </div>
            {inProgressTrack ? (
              <div className="space-y-3">
                <p className="text-[10px] font-label font-700 uppercase tracking-wider text-neutral-400">
                  Track {inProgressTrack.number} · {inProgressTrack.title}
                </p>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{ width: `${inProgressTrack.progress}%` }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-400 font-body">{inProgressTrack.progress}% complete</span>
                  <button className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-dark text-white text-xs font-700 font-label px-4 py-2 rounded-lg transition-all duration-200 shadow-sm">
                    <PlayCircle size={13} /> Resume Unit
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-body text-neutral-500">No unit in progress. Head to your courses to continue.</p>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base text-neutral-800">Recent Activity</h3>
              <Clock size={16} className="text-neutral-400" />
            </div>
            <ul className="space-y-4">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    item.done ? "bg-primary-50 text-primary-500" : "bg-secondary-50 text-secondary-700"
                  }`}>
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
      ) : (
        /* Empty state */
        <div className="bg-white border border-dashed border-neutral-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
            <Award size={24} />
          </div>
          <div>
            <p className="font-headline font-bold text-neutral-800 text-base">No courses enrolled yet</p>
            <p className="text-sm font-body text-neutral-500 mt-1 max-w-xs mx-auto">
              Browse our seven tracks and enroll in the ones that match your leadership goals.
            </p>
          </div>
        </div>
      )}

      {/* Certificate banner */}
      {enrolledTracks.some((t) => t.number === 1 && t.status === "completed") && (
        <div className="bg-secondary-50 border border-secondary-200 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-secondary-500 flex items-center justify-center shrink-0">
            <Award size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-label font-700 text-secondary-700 uppercase tracking-wider mb-0.5">Certificate Earned</p>
            <p className="text-sm font-semibold text-neutral-800 font-body">
              Track 1 · Foundational Leadership — Certificate of Completion
            </p>
          </div>
          <button className="shrink-0 text-xs font-700 font-label text-secondary-700 border border-secondary-300 px-4 py-2 rounded-lg hover:bg-secondary-100 transition-all duration-200">
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}