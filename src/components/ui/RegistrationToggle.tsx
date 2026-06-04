
interface RegistrationToggleProps {
  options: { id: string; label: string; icon: string }[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function RegistrationToggle({ options, selectedId, onChange }: RegistrationToggleProps) {
  return (
    <div className="relative flex p-1 bg-neutral-100 rounded-xl mb-6 border border-neutral-200">
      {options.map((option) => {
        const isActive = option.id === selectedId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs font-700 font-label transition-colors duration-200 rounded-lg
              ${isActive ? "bg-white text-primary shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
          >
            <span className="material-symbols-outlined text-[18px]">{option.icon}</span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}