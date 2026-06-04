import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconName?: string;
}

export default function AuthInput({ label, iconName, id, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label 
        htmlFor={id} 
        className="text-sm font-700 text-neutral-800 block font-body"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {iconName && (
          <span className="material-symbols-outlined absolute left-4 text-neutral-500 text-[20px] pointer-events-none select-none">
            {iconName}
          </span>
        )}
        <input
          id={id}
          {...props}
          className={`w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm ${
            iconName ? "pl-11 pr-4" : "px-4"
          } py-3`}
        />
      </div>
    </div>
  );
}