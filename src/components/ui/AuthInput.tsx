import React from "react";
// 1. Import the LucideIcon type from the package
import type { LucideIcon } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  // 2. Update the prop to accept a Lucide component instead of a string string
  icon?: LucideIcon; 
}

// 3. Destructure 'icon: Icon' to rename it to a capital letter so React can render it as a component
export default function AuthInput({ label, icon: Icon, id, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label 
        htmlFor={id} 
        className="text-sm font-700 text-neutral-800 block font-body"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {/* 4. Render the Icon component if it exists */}
        {Icon && (
          <Icon 
            size={20} 
            className="absolute left-4 text-neutral-500 pointer-events-none select-none" 
          />
        )}
        <input
          id={id}
          {...props}
          className={`w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm ${
            Icon ? "pl-11 pr-4" : "px-4"
          } py-3`}
        />
      </div>
    </div>
  );
}