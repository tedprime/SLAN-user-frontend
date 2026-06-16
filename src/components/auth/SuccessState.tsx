import { CheckCircle2, Info } from "lucide-react";
import Button from "../ui/Button";

interface SuccessStateProps {
  method: string;
}

export default function SuccessState({ method }: SuccessStateProps) {
  return (
    <div className="text-center step-transition py-4">
      <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={36} />
      </div>
      <h2 className="text-2xl font-800 font-headline text-neutral-800 tracking-tight">Recovery Dispatched</h2>
      <p className="text-sm font-body text-neutral-500 mt-2 mb-6 leading-relaxed max-w-sm mx-auto">
        A link or security parameter was dispatched to your selected{" "}
        <strong className="text-neutral-700">{method}</strong> gateway.
      </p>
      <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-3.5 text-xs text-neutral-500 font-body mb-6 text-left flex gap-2">
        <Info size={18} className="text-neutral-400 shrink-0 mt-0.5" />
        <span>Check junk/spam if a confirmation doesn't arrive within 3 minutes.</span>
      </div>
      <Button href="/login" variant="primary" className="w-full justify-center py-3 rounded-xl">
        Return to Portal Login
      </Button>
    </div>
  );
}