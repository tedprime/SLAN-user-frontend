import React, { useState } from "react";
import AuthNavbar from "../components/layout/AuthNavbar";
import AuthFooter from "../components/layout/AuthFooter";
import OtpInput from "../components/ui/OtpInput";
import CountdownTimer from "../components/ui/CountdownTimer";
import { useCountdown } from "../hooks/useCountdown";
import Button from "../components/ui/Button";

export default function OtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const { formatTime, isCompleted, resetCountdown } = useCountdown(120);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = otp.join("");
    if (pin.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert(`OTP sequence ${pin} authenticated. Syncing learner dashboard session.`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-50 justify-between">
      <AuthNavbar />

      {/* Main Container: Responsive padding rules protect smaller vertical screen boundaries */}
      <main className="flex-1 flex items-center justify-center w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="w-full bg-white border border-neutral-200/80 rounded-xl sm:rounded-2xl p-5 xs:p-6 sm:p-10 shadow-sm text-center">
          
          {/* Decorative Icon Wrapper */}
          <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[24px]">phonelink_lock</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-800 font-headline text-neutral-800 tracking-tight">
            Security Check
          </h2>
          <p className="text-xs sm:text-sm font-body text-neutral-500 mt-2 max-w-xs mx-auto leading-relaxed">
            We sent a 6-digit code to your email
          </p>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-6">
            {/* Standard inputs must scale internally via their own styles or flex wrapping */}
            <div className="w-full overflow-x-auto py-1 flex justify-center">
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 rounded-sm flex items-center gap-2 text-sm font-600 transition-all"
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  <span>Verifying Signatures...</span>
                </>
              ) : (
                "Authorize Operational Session"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-2">
            <CountdownTimer
              formattedTime={formatTime()}
              isCompleted={isCompleted}
              onResend={() => {
                resetCountdown(120);
                alert("A fresh secure validation token has been successfully queued.");
              }}
            />
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}