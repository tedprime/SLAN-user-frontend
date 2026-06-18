interface ProgressProps {
  value?: number;
  className?: string;
  color?: string;
}

export default function Progress({
  value = 0,
  className = "",
  color,
}: ProgressProps) {
  const fillColor = color || "#006400";

  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full ${className}`}
      style={{ backgroundColor: "#e8e8e8" }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: fillColor,
          opacity: 0.8,
        }}
      />
    </div>
  );
}
