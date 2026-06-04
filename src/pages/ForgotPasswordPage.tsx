import { useState } from "react";
import AuthNavbar from "../components/layout/AuthNavbar";
import AuthFooter from "../components/layout/AuthFooter";
import StepperBar from "../components/ui/StepperBar";
import IdentifierStep from "../components/auth/IdentifierStep";
import ResetMethodStep from "../components/auth/ResetMethodStep";
import SuccessState from "../components/auth/SuccessState";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1, 2, 3 (Success)
  const [identifier, setIdentifier] = useState("");
  const [recoveryMethod, setRecoveryMethod] = useState("");

  const handleIdentifierSubmit = (id: string) => {
    setIdentifier(id);
    setStep(2);
  };

  const handleMethodConfirm = (method: string) => {
    setRecoveryMethod(method);
    setStep(3);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-50 relative justify-between">
      <AuthNavbar />

      <div className="my-auto max-w-md w-full mx-auto px-6 py-32">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-10 shadow-sm">
          {step <= 2 && <StepperBar currentStep={step} totalSteps={2} />}

          {step === 1 && <IdentifierStep onNext={handleIdentifierSubmit} />}

          {step === 2 && (
            <ResetMethodStep
              identifier={identifier}
              onConfirm={handleMethodConfirm}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && <SuccessState method={recoveryMethod} />}
        </div>
      </div>

      <AuthFooter />
    </div>
  );
}