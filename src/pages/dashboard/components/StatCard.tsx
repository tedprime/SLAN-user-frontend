interface StatCardProps {
  value: string;
  label: string;
  sub: string;
  accent?: boolean;
}

export default function StatCard({ value, label, sub, accent = false }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 border flex flex-col gap-1 shadow-card ${
      accent
        ? "bg-primary-500 border-primary-600 text-white"
        : "bg-white border-neutral-200 text-neutral-800"
    }`}>
      <span className={`font-headline font-bold text-2xl ${accent ? "text-white" : "text-tertiary-500"}`}>
        {value}
      </span>
      <span className={`text-sm font-semibold font-body ${accent ? "text-white/90" : "text-neutral-700"}`}>
        {label}
      </span>
      <span className={`text-xs font-body ${accent ? "text-white/60" : "text-neutral-400"}`}>
        {sub}
      </span>
    </div>
  );
}