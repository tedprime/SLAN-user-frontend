interface Track {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  modules?: number;
  units?: number;
}

interface TrackCardProps {
  track: Track;
  delay?: number;
}

export default function TrackCard({ track, delay = 0 }: TrackCardProps) {
  const { number, icon, title, description, modules = 3, units = 15 } = track;

  return (
    <div
      className="group relative z-0 bg-white border border-neutral-200 rounded-2xl
                 flex flex-col hover:border-primary-500 shadow-card animate-fade-in-up
                 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* ── Card body ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-6 flex-1">

        {/* Icon */}
        <div className="w-11 h-11 rounded-sm p-2 text-primary-500 flex items-center justify-center
                        text-base group-hover:text-white group-hover:bg-primary-500 transition-all duration-200">
          {icon}
        </div>

        {/* Track label — fixed height so titles always start at same line */}
        <p className="text-xs font-label font-700 text-neutral-400 capitalize tracking-normal h-4 flex items-center">
          Track {number}
        </p>

        {/* Title — fixed min-height so descriptions always start at same line */}
        <h4 className="font-headline font-bold text-base text-neutral-800 leading-snug min-h-[3rem]">
          {title}
        </h4>

        {/* Description — grows to fill remaining space */}
        <p className="font-body text-xs text-neutral-600 leading-relaxed flex-1">
          {description}
        </p>
      </div>

      {/* ── Card footer ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 mb-1">
        <span className="text-[11px] font-label uppercase text-neutral-600">
          {modules} Modules
        </span>
        <span className="text-[11px] font-label uppercase text-neutral-600">
          {units} Units
        </span>
      </div>
    </div>
  );
}