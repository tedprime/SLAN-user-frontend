import React, { useState } from "react";
import AuthInput from "../ui/AuthInput";
import { authService } from "../../services/authService";

interface StepOneProps {
  email: string;
  setEmail: (val: string) => void;
  onContinue: () => void;
}

export default function SignUpStepOne({
  email,
  setEmail,
  onContinue,
}: StepOneProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.checkEmail({ email });
      onContinue();
    } catch (err) {
  const e = err as { statusCode?: number; status?: number; message?: string };
  if (e?.statusCode === 409 || e?.status === 409) {
    setError("This email is already registered. Try logging in instead.");
  } else {
    setError(e?.message || "Something went wrong. Please try again.");
  }
}
    finally {
      setIsLoading(false);
    }
  };

  const handleGoogleContinue = async () => {
    try {
      const { url } = await authService.getGoogleSignupUrl();
      window.location.href = url;
    } catch {
      setError("Could not initiate Google sign up. Please try again.");
    }
  };

  return (
    <form onSubmit={handleNextStep} className="space-y-5">
      <AuthInput
        label="Email Address"
        id="reg-email"
        type="email"
        placeholder="example@email.com"
        iconName="mail"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError("");
        }}
        required
      />

      {error && (
        <p className="text-xs font-600 text-red-500 font-body -mt-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full justify-center py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-600 text-sm inline-flex items-center gap-2 transition-colors rounded-sm"
      >
        {isLoading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[16px]">
              progress_activity
            </span>
            Checking...
          </>
        ) : (
          <>
            Continue Registration
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </>
        )}
      </button>

      <div className="relative flex py-2 items-center text-center">
        <div className="flex-1 border-t border-neutral-200"></div>
        <span className="shrink mx-4 text-xs font-600 font-body text-neutral-500">or</span>
        <div className="flex-1 border-t border-neutral-200"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleContinue}
        className="w-full py-3 px-4 border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-sm font-600 font-body transition-colors flex items-center justify-center gap-3 focus:outline-none rounded-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.055 14.98 0 12 0 7.354 0 3.307 2.69 1.299 6.614l3.967 3.151z" />
          <path fill="#4285F4" d="M23.49 12.275c0-.796-.073-1.564-.205-2.304H12v4.358h6.443a5.504 5.504 0 01-2.386 3.614l3.714 2.878c2.173-2.002 3.429-4.945 3.429-8.542z" />
          <path fill="#FBBC05" d="M5.266 14.235L1.3 17.386A11.947 11.947 0 010 12c0-1.923.455-3.743 1.299-5.386l3.967 3.151A7.031 7.031 0 005.143 12c0 .787.13 1.543.123 2.235z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.956-1.075 7.942-2.916l-3.714-2.878c-1.03.69-2.343 1.103-4.228 1.103-3.23 0-5.964-2.182-6.939-5.114L1.095 17.34A11.956 11.956 0 0012 24z" />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}