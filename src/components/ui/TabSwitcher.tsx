interface TabSwitcherProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function TabSwitcher({
  tabs,
  activeTab,
  onChange,
}: TabSwitcherProps) {
  return (
    <div className="flex border-b border-neutral-200 mb-6">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 text-center py-3 text-sm font-600 font-body transition-all border-b-2 duration-200 
              ${isActive ? "text-primary border-primary font-bold" : "text-neutral-500 border-transparent hover:text-neutral-800"}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
