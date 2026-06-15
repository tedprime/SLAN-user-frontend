import { useState } from "react";
import TrackRow from "./TrackRow";
import type { Track } from "../index";

type Filter = "all" | "in-progress" | "completed" | "locked";

interface CoursesViewProps {
  tracks: Track[];
  enrolledNumbers: Set<number>;
  onEnroll: (trackNumber: number) => void;
}

export default function CoursesView({ tracks, enrolledNumbers, onEnroll }: CoursesViewProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all"
    ? tracks
    : tracks.filter((t) => {
        if (filter === "locked") return t.status === "locked" && !enrolledNumbers.has(t.number);
        return t.status === filter;
      });

  const completedCount = tracks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">

      <div>
        <h2 className="font-headline font-bold text-2xl text-neutral-800">Seven Tracks of Excellence</h2>
        <p className="text-sm font-body text-neutral-500 mt-1">21 Modules · 105 Units · One complete leadership transformation</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
        {(["all", "in-progress", "completed", "locked"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-700 font-label transition-all duration-200 ${
              filter === f ? "bg-white text-primary-500 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-card">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-label font-700 text-neutral-500 uppercase tracking-wider">Programme Progress</span>
          <span className="text-xs font-700 font-label text-primary-500 bg-primary-50 px-2.5 py-1 rounded-md">
            {completedCount} of 7 Tracks Complete
          </span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.round((completedCount / 7) * 100)}%`, background: "linear-gradient(90deg, #006400, #1a7a1a)" }}
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
                  t.status === "completed"   ? "#006400" :
                  t.status === "in-progress" ? "#d4af37" :
                  enrolledNumbers.has(t.number) ? "#bfcab7" : "#e8e8e8",
              }}
            />
          ))}
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm font-body text-neutral-400 text-center py-8">No tracks match this filter.</p>
        ) : (
          filtered.map((track) => (
            <TrackRow
              key={track.number}
              track={track}
              isEnrolled={enrolledNumbers.has(track.number)}
              onEnroll={onEnroll}
            />
          ))
        )}
      </div>
    </div>
  );
}