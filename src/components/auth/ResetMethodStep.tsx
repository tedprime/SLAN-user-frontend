import{ useState } from "react";
import VerificationRadio from "../ui/VerificationRadio";
import Button from "../ui/Button";

interface ResetMethodStepProps {
  identifier: string;
  onConfirm: (method: string) => void;
  onBack: () => void;
}

export default function ResetMethodStep({ identifier, onConfirm, onBack }: ResetMethodStepProps) {
  const [selectedMethod, setSelectedMethod] = useState("email");

  return (
    <div className="step-transition">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-600 text-neutral-400 hover:text-primary mb-4 transition-colors">
        <span className="material-symbols-outlined text-[14px]">arrow_back</span> Change Identity
      </button>
      <h2 className="text-2xl font-800 font-headline text-neutral-800 tracking-tight">Select Reset Target</h2>
      <p className="text-sm font-body text-neutral-500 mt-1 mb-6">
        We verified an account for <strong className="text-neutral-700">{identifier}</strong>. Select your recovery target channel:
      </p>

      <div className="space-y-3">
        <VerificationRadio
          id="email"
          title="Send Link via Email"
          description="Instant distribution to your primary recovery inbox."
          icon="alternate_email"
          isSelected={selectedMethod === "email"}
          onSelect={() => setSelectedMethod("email")}
        />
        <VerificationRadio
          id="sms"
          title="Send SMS Verification Code"
          description="Standard carrier push to registered mobile endpoint."
          icon="sms"
          isSelected={selectedMethod === "sms"}
          onSelect={() => setSelectedMethod("sms")}
        />
      </div>

      <Button
        onClick={() => onConfirm(selectedMethod)}
        variant="primary"
        className="w-full justify-center mt-6 py-3 rounded-xl"
      >
        Transmit Secure Recovery Link
      </Button>
    </div>
  );
}