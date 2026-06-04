interface StepperBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepperBar({ currentStep, totalSteps }: StepperBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-700 font-label tracking-wider text-neutral-400 uppercase">Recovery Mode</span>
        <span className="text-xs font-700 font-label text-primary bg-primary-50 px-2.5 py-1 rounded-md">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/50">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}