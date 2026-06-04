interface VerificationRadioProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function VerificationRadio({
  id,
  title,
  description,
  icon,
  isSelected,
  onSelect,
}: VerificationRadioProps) {
  return (
    <label
      htmlFor={id}
      className={`group w-full p-4 rounded-xl border-2 flex items-start gap-4 cursor-pointer transition-all duration-200 bg-white
        ${isSelected ? "border-primary bg-primary-50/10 shadow-sm" : "border-neutral-200 hover:border-neutral-300"}`}
    >
      <input
        id={id}
        type="radio"
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />
      <div className={`p-2.5 rounded-lg flex items-center justify-center transition-colors
        ${isSelected ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div className="flex-1 text-left">
        <h4 className="text-sm font-700 text-neutral-800 font-headline leading-snug">{title}</h4>
        <p className="text-xs text-neutral-500 font-body mt-0.5">{description}</p>
      </div>
      <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all">
        <div className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform scale-0 ${isSelected ? "scale-100" : ""}`} />
      </div>
    </label>
  );
}