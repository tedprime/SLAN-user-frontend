import Button from "../ui/Button";

interface SuccessStateProps {
  method: string;
}

export default function SuccessState({ method }: SuccessStateProps) {
  return (
    <div className="text-center step-transition py-4">
      <div className="w-16 h-16 bg-success-green/10 text-success-green rounded-full flex items-center justify-center mx-auto mb-5">
        <span className="material-symbols-outlined text-[36px] fill-0 font-bold">check_circle</span>
      </div>
      <h2 className="text-2xl font-800 font-headline text-neutral-800 tracking-tight">Recovery Dispatched</h2>
      <p className="text-sm font-body text-neutral-500 mt-2 mb-6 leading-relaxed max-w-sm mx-auto">
        Authentication variables successfully adjusted. A link or security parameter was dispatched to your selected{" "}
        <strong className="text-neutral-700">{method}</strong> gateway.
      </p>

      <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-3.5 text-xs text-neutral-500 font-body mb-6 text-left flex gap-2">
        <span className="material-symbols-outlined text-neutral-400 text-[18px]">info</span>
        <span>Ensure to verify junk/spam directories if a transactional confirmation fails to register within 3 minutes.</span>
      </div>

      <Button href="/login" variant="primary" className="w-full justify-center py-3 rounded-xl">
        Return to Portal Login
      </Button>
    </div>
  );
}