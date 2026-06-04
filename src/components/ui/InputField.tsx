import React, { useState } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconName?: string;
  error?: string;
}

export default function InputField({
  label,
  iconName,
  error,
  type = "text",
  className = "",
  id,
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-600 text-neutral-800 font-body">
        {label}
      </label>
      <div className="relative w-full">
        {iconName && (
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400 select-none">
            {iconName}
          </span>
        )}
        <input
          id={id}
          type={currentType}
          className={`w-full font-body text-sm bg-white border rounded-xl transition-all duration-200 outline-none
            ${iconName ? "pl-11" : "px-4"} 
            ${isPassword ? "pr-11" : "pr-4"} 
            py-3 text-neutral-800 placeholder-neutral-400 focus:bg-white
            ${error ? "border-error-red focus:ring-2 focus:ring-error-red/20" : "border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/10"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors select-none focus:outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-error-red font-body mt-0.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}