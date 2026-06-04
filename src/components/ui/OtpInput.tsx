import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function OtpInput({ value, onChange }: OtpInputProps) {
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // Focus first element on construct
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (val: string, index: number) => {
    const cleanValue = val.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...value];
    updated[index] = cleanValue;
    onChange(updated);

    if (cleanValue && index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0 && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    const updated = [...value];
    for (let i = 0; i < 6; i++) {
      updated[i] = text[i] || "";
    }
    onChange(updated);
    const focusIdx = Math.min(text.length, 5);
    if (inputsRef.current[focusIdx]) inputsRef.current[focusIdx].focus();
  };

  return (
    <div 
      className="flex justify-center items-center w-full max-w-sm mx-auto gap-1.5 xs:gap-2 sm:gap-3 my-4 sm:my-6" 
      onPaste={handlePaste}
    >
      {value.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { if (el) inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoCapitalize="off"
          autoCorrect="off"
          value={digit}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className="w-full max-w-[44px] sm:max-w-[48px] aspect-[6/7] text-center font-headline text-lg sm:text-xl font-bold text-neutral-800 bg-white border border-neutral-200 rounded-lg sm:rounded-xl shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none"
        />
      ))}
    </div>
  );
}