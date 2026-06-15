import { CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import type { Track } from "../index"

interface TrackRowProps {
  track: Track;
  isEnrolled: boolean;
  onEnroll: (trackNumber: number) => void;
}

export default function TrackRow({ track, isEnrolled, onEnroll }: TrackRowProps) {
  const isLocked = track.status === "locked" && !isEnrolled;
  const isDone   = track.status === "completed";

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group ${
      isLocked
        ? "bg-neutral-50 border-neutral-100 opacity-50 cursor-not-allowed"
        : "bg-white border-neutral-200 hover:border-primary-300 hover:shadow-card cursor-pointer"
    }`}>

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
        isDone   ? "bg-primary-500 text-white" :
        isLocked ? "bg-neutral-200 text-neutral-400" :
                   "bg-primary-50 text-primary-500 group-hover:bg-primary-500 group-hover:text-white"
      }`}>
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
          {isEnrolled && track.status === "locked" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-700 font-label text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Enrolled
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-neutral-800 font-body truncate">{track.title}</p>
        {!isLocked && track.progress > 0 && (
          <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${track.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Right */}
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <span className="text-xs font-body text-neutral-500">
          {track.modules} modules · {track.units} units
        </span>
        {!isLocked && track.progress > 0 && (
          <span className="text-xs font-700 font-label text-primary-500">{track.progress}%</span>
        )}
        {isLocked && !isEnrolled ? (
          <button
            onClick={() => onEnroll(track.number)}
            className="text-xs font-700 font-label text-primary-500 border border-primary-300 px-3 py-1 rounded-lg hover:bg-primary-50 transition-all duration-200"
          >
            Enroll
          </button>
        ) : (
          !isLocked && <ChevronRight size={14} className="text-neutral-300 mt-0.5" />
        )}
      </div>
    </div>
  );
}