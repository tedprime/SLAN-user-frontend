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

// Local landing-page track images — named after the track's title,
// slugified (e.g. "Foundational Leadership" → foundational-leadership.jpg).
// Drop files in public/images/landing-tracks/. Missing a file just means
// the card falls back to a plain dark card — nothing breaks.
const IMAGE_BASE_PATH = "/images/landing-tracks/";
const IMAGE_EXT = ".jpg";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TrackCard({ track, delay = 0 }: TrackCardProps) {
  const { number, icon, title, description, modules = 3, units = 15 } = track;
  const imageSrc = `${IMAGE_BASE_PATH}${slugify(title)}${IMAGE_EXT}`;

  return (
    <div
      className="group relative z-0 rounded-2xl flex flex-col overflow-hidden
                 border border-neutral-200 hover:border-primary-500
                 shadow-card animate-fade-in-up transition-colors duration-200
                 bg-primary-900"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background image */}
      <img
        src={imageSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover
                   transition-transform duration-500 ease-out group-hover:scale-105"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />

      {/* Dark wash so text stays legible over any image */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black/80" />

      {/* ── Card body ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-3 p-6 flex-1">

        {/* Icon */}
        <div className="w-11 h-11 rounded-sm p-2 text-white flex items-center justify-center
                        text-base bg-white/15 backdrop-blur-sm
                        group-hover:text-white group-hover:bg-primary-500 transition-all duration-200">
          {icon}
        </div>

        {/* Track label — fixed height so titles always start at same line */}
        <p className="text-xs font-label font-700 text-white/60 capitalize tracking-normal h-4 flex items-center">
          Track {number}
        </p>

        {/* Title — fixed min-height so descriptions always start at same line */}
        <h4 className="font-headline font-bold text-base text-white leading-snug min-h-[3rem]">
          {title}
        </h4>

        {/* Description — grows to fill remaining space */}
        <p className="font-body text-xs text-white/80 leading-relaxed flex-1">
          {description}
        </p>
      </div>

      {/* ── Card footer ───────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 mb-1">
        <span className="text-[11px] font-label uppercase text-white/70">
          {modules} Modules
        </span>
        <span className="text-[11px] font-label uppercase text-white/70">
          {units} Units
        </span>
      </div>
    </div>
  );
}