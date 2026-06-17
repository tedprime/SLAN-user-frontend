import React, { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import AuthNavbar from "../components/layout/AuthNavbar";
import AuthFooter from "../components/layout/AuthFooter";
import OtpInput from "../components/ui/OtpInput";
import CountdownTimer from "../components/ui/CountdownTimer";
import { useCountdown } from "../hooks/useCountdown";
import Button from "../components/ui/Button";
import { authService } from "../services/authService";
import { setTokens, setUser } from "../services/tokenService";
import { enrollmentService } from "../services/enrollmentservice";

function getQueryParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

export default function OtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { formatTime, isCompleted, resetCountdown } = useCountdown(120);

  const flow = getQueryParam("flow");
  const email = getQueryParam("email");

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = otp.join("");
    if (pin.length !== 6) return;
    setError("");
    setIsLoading(true);
    try {
      const payload = { email, otp: pin };
      const result =
        flow === "signup"
          ? await authService.verifySignupOtp(payload)
          : await authService.verifyLoginOtp(payload);
      const tokens = result.data;
      setTokens(tokens);
      if (tokens.user) setUser(tokens.user);

      // If they were redirected here from clicking Enrol while logged out,
      // resume that enrollment now and send them straight to the Courses tab.
      const intentRaw = sessionStorage.getItem("postLoginIntent");
      sessionStorage.removeItem("postLoginIntent");

      if (intentRaw) {
        const { intent, trackId } = JSON.parse(intentRaw);
        if (intent === "enroll") {
          try {
            const existing = await enrollmentService.getEnrollment(trackId);
            if (!existing) await enrollmentService.enroll(trackId);
          } catch (enrollErr) {
            // Don't block login on this — they'll just land on a dashboard
            // without the enrollment having gone through; worth a toast later.
            console.error("Enrollment failed after login:", enrollErr);
          }
          navigateTo("/dashboard?nav=courses");
          return;
        }
      }

      navigateTo("/dashboard");
    } catch (err) {
      const e = err as {
        statusCode?: number;
        status?: number;
        message?: string;
      };
      const status = e?.statusCode ?? e?.status;
      if (status === 400 || status === 401) {
        setError("Invalid or expired code. Please try again.");
      } else {
        setError(e?.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      if (flow === "signup") {
        await authService.resendSignupOtp({ email });
      } else {
        await authService.resendLoginOtp({ email });
      }
      resetCountdown(120);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || "Could not resend code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-50 justify-between">
      <AuthNavbar />
      <main className="flex-1 flex items-center justify-center w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="w-full bg-white border border-neutral-200/80 rounded-xl sm:rounded-2xl p-5 xs:p-6 sm:p-10 shadow-sm text-center">
          <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-800 font-headline text-neutral-800 tracking-tight">
            Security Check
          </h2>
          <p className="text-xs sm:text-sm font-body text-neutral-500 mt-2 max-w-xs mx-auto leading-relaxed">
            We sent a 6-digit code to{" "}
            {email ? (
              <strong className="text-neutral-700">{email}</strong>
            ) : (
              "your email"
            )}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-6">
            <div className="w-full overflow-x-auto py-1 flex justify-center">
              <OtpInput value={otp} onChange={setOtp} />
            </div>
            {error && (
              <p className="text-xs font-600 text-red-500 font-body">{error}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 rounded-sm flex items-center gap-2 text-sm font-600 transition-all"
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying...</span>
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
              onResend={handleResend}
            />
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
