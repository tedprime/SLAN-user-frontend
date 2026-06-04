import React, { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

interface IdentifierStepProps {
  onNext: (identifier: string) => void;
}

export default function IdentifierStep({ onNext }: IdentifierStepProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onNext(input);
  };

  return (
    <form onSubmit={handleSubmit} className="step-transition">
      <h2 className="text-2xl font-800 font-headline text-neutral-800 tracking-tight">Recover Password</h2>
      <p className="text-sm font-body text-neutral-500 mt-2 mb-6">
        Provide your registered administrative email address or professional portal identifier to isolate your parameters.
      </p>

      <InputField
        label="Portal Identity / Email"
        id="recovery-id"
        type="text"
        placeholder="leader@academy.ng"
        iconName="fingerprint"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" className="w-full justify-center mt-6 py-3 rounded-xl">
        Locate Profile Identity
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </Button>
    </form>
  );
}