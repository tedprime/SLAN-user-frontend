interface CountdownTimerProps {
  formattedTime: string;
  isCompleted: boolean;
  onResend: () => void;
}

export default function CountdownTimer({ formattedTime, isCompleted, onResend }: CountdownTimerProps) {
  return (
    <div className="text-center font-body text-sm mt-4">
      {!isCompleted ? (
        <p className="text-neutral-500 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] animate-pulse">schedule</span>
          Resend code in <span className="font-600 text-neutral-800">{formattedTime}</span>
        </p>
      ) : (
        <div className="animate-fade-in-up">
          <p className="text-neutral-500 mb-2">Didn't receive the secure validation code?</p>
          <button
            type="button"
            onClick={onResend}
            className="text-primary font-700 hover:text-primary-dark transition-colors inline-flex items-center gap-1 text-sm focus:outline-none"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Resend Verification Code
          </button>
        </div>
      )}
    </div>
  );
}