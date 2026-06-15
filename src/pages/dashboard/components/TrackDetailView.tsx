import { PlayCircle, CheckCircle2, Lock } from "lucide-react";
import type { Track } from "../index";

const MODULE_NAMES = [
  "Core Principles & Foundations",
  "Applied Strategies & Frameworks",
  "Assessment & Implementation",
];
const UNITS_PER_MODULE = 5;

export default function TrackDetailView({ track }: { track: Track }) {
  const isLocked = track.status === "locked";
  const isDone   = track.status === "completed";

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in-up">

      {/* Track header card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card flex items-start gap-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          isDone   ? "bg-primary-500 text-white" :
          isLocked ? "bg-neutral-200 text-neutral-400" :
                     "bg-primary-50 text-primary-500"
        }`}>
          {track.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-label font-700 uppercase tracking-wider text-neutral-400 mb-1">Track {track.number}</p>
          <h2 className="font-headline font-bold text-xl text-neutral-800 leading-snug">{track.title}</h2>
          <p className="text-sm font-body text-neutral-500 mt-1">{track.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs font-label font-700 text-neutral-500">{track.modules} Modules</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span className="text-xs font-label font-700 text-neutral-500">{track.units} Units</span>
          </div>
        </div>
        <div className="shrink-0">
          {isDone && (
            <span className="inline-flex items-center gap-1.5 text-xs font-700 font-label text-primary-500 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
          {track.status === "in-progress" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-700 font-label text-secondary-700 bg-secondary-50 border border-secondary-200 px-3 py-1.5 rounded-full">
              <PlayCircle size={12} /> {track.progress}% Complete
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isLocked && (
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{ width: `${track.progress}%` }} />
        </div>
      )}

      {/* Modules */}
      <div className="space-y-4">
        <h3 className="font-headline font-bold text-base text-neutral-800">Modules</h3>
        {MODULE_NAMES.map((moduleName, mIdx) => {
          const moduleProgress =
            track.progress >= ((mIdx + 1) / 3) * 100 ? 100 :
            track.progress >= (mIdx / 3) * 100
              ? Math.round(((track.progress - (mIdx / 3) * 100) / (100 / 3)) * 100) : 0;
          const moduleComplete = moduleProgress === 100;
          const moduleActive   = moduleProgress > 0 && !moduleComplete;

          return (
            <div key={mIdx} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-card">
              {/* Module header */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-neutral-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  moduleComplete ? "bg-primary-500 text-white" :
                  moduleActive   ? "bg-secondary-100 text-secondary-700" :
                                   "bg-neutral-100 text-neutral-500"
                }`}>
                  {mIdx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-label font-700 uppercase tracking-wider text-neutral-400">Module {mIdx + 1}</p>
                  <p className="text-sm font-semibold text-neutral-800 font-body">{moduleName}</p>
                </div>
                {moduleComplete && <CheckCircle2 size={16} className="text-primary-500 shrink-0" />}
                {moduleActive   && <span className="text-xs font-700 font-label text-secondary-700 bg-secondary-50 px-2.5 py-1 rounded-full">{moduleProgress}%</span>}
                {isLocked       && <Lock size={14} className="text-neutral-300 shrink-0" />}
              </div>

              {/* Units */}
              <ul className="divide-y divide-neutral-50">
                {Array.from({ length: UNITS_PER_MODULE }).map((_, uIdx) => {
                  const unitNumber  = mIdx * UNITS_PER_MODULE + uIdx + 1;
                  const unitComplete = track.progress >= (unitNumber / track.units) * 100;
                  const unitActive   = !unitComplete && moduleActive && uIdx === 0;

                  return (
                    <li key={uIdx} className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                      isLocked     ? "opacity-40 cursor-not-allowed" :
                      unitComplete ? "hover:bg-primary-50/30 cursor-pointer" :
                      unitActive   ? "bg-secondary-50/40 hover:bg-secondary-50 cursor-pointer" :
                                     "opacity-50 cursor-not-allowed"
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        unitComplete ? "bg-primary-500 text-white" :
                        unitActive   ? "bg-secondary-300 text-secondary-800" :
                                       "bg-neutral-100 text-neutral-400"
                      }`}>
                        {unitComplete ? <CheckCircle2 size={12} /> :
                         unitActive   ? <PlayCircle size={12} /> :
                                        <Lock size={10} />}
                      </div>
                      <span className="text-xs font-body text-neutral-700 flex-1 truncate">
                        Unit {unitNumber}
                        {unitActive && <span className="ml-2 text-[10px] font-700 font-label text-secondary-700 uppercase tracking-wider">· In Progress</span>}
                      </span>
                      {unitActive && (
                        <button className="shrink-0 inline-flex items-center gap-1 text-xs font-700 font-label text-white bg-primary-500 hover:bg-primary-dark px-3 py-1.5 rounded-lg transition-colors">
                          <PlayCircle size={12} /> Resume
                        </button>
                      )}
                      {unitComplete && <span className="text-[10px] font-label font-700 text-primary-400 shrink-0 uppercase">Done</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}