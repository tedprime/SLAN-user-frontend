import React, { useState } from "react";
import AuthNavbar from "../components/layout/AuthNavbar";
import AuthFooter from "../components/layout/AuthFooter";
import OtpInput from "../components/ui/OtpInput";
import CountdownTimer from "../components/ui/CountdownTimer";
import { useCountdown } from "../hooks/useCountdown";
import Button from "../../src/components/ui/Button";

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
    <div className="min-h-screen w-full flex flex-col bg-neutral-50 relative justify-between">
      <AuthNavbar />

      <div className="my-auto max-w-md w-full mx-auto px-6 py-32">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-10 shadow-sm text-center">
          <div className="w-12 h-12 bg-primary-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[24px]">phonelink_lock</span>
          </div>
          <h2 className="text-2xl font-800 font-headline text-neutral-800 tracking-tight">Security Check</h2>
          <p className="text-sm font-body text-neutral-500 mt-2 max-w-xs mx-auto">
            We forwarded an operational 6-digit session key to your linked communication endpoints.
          </p>

          <form onSubmit={handleSubmit}>
            <OtpInput value={otp} onChange={setOtp} />

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 rounded-xl"
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Verifying Signatures...
                </>
              ) : (
                "Authorize Operational Session"
              )}
            </Button>
          </form>

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

      <AuthFooter />
    </div>
  );
}