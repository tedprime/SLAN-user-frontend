interface Track {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TrackCardProps {
  track: Track;
  delay?: number;
}

export default function TrackCard({ track, delay = 0 }: TrackCardProps) {
  const { number, icon, title, description } = track;

  return (
    <div
      className="group bg-white border border-neutral-200 rounded-2xl p-6 
             flex flex-col gap-3 hover:border-primary-500 shadow-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Track icon */}
      <div className="w-11 h-11 rounded-sm p-2 text-primary-500 flex items-center justify-center text-base group-hover:text-white group-hover:bg-primary-500 transition-all duration-200">
        {icon}
      </div>

      {/* Track label */}
      <p className="text-xs font-label font-700 text-neutral-800 capitalize tracking-normal">
        Track {number}
      </p>

      {/* Title */}
      <h4 className="font-headline font-bold text-lg text-neutral-800 leading-snug">
        {title}
      </h4>

      {/* Description */}
      <p className="font-body text-xs text-neutral-700 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
