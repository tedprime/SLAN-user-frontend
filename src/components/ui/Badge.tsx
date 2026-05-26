type BadgeColor = "initiative" | "primary" | "dark" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  initiative:
    "bg-secondary-300 text-primary-800 border border-secondary-200",
  primary:
    "bg-primary-50 text-primary-600 border border-primary-200",
  dark: "bg-tertiary-500 text-white",
  neutral:
    "bg-neutral-100 text-neutral-600 border border-neutral-200",
};

export default function Badge({
  children,
  color = "initiative",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-block font-label text-[0.65rem] font-600 uppercase tracking-widest px-3 py-1 rounded-full",
        colorMap[color],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}