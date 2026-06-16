import React, { useState } from "react";
import { Lock, KeyRound, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import AuthNavbar from "../components/layout/AuthNavbar";
import AuthInput from "../components/ui/AuthInput";
import { authService } from "../services/authService";

export default function ForgotPasswordPage() {
  const urlToken = new URLSearchParams(window.location.search).get("token");
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(urlToken ? 3 : 1);
  const [emailAddress, setEmailAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [resetToken] = useState(urlToken ?? "");

  const navigateTo = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: emailAddress });
      setRecoveryStep(2);
    } catch (err) {
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e?.statusCode ?? e?.status;
      if (status === 404) {
        setError("No account found with that email address.");
      } else {
        setError(e?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepThreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMatchError("");
    setError("");
    if (newPassword !== confirmNewPassword) {
      setMatchError("The passwords provided do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword({ token: resetToken, newPassword, confirmPassword: confirmNewPassword });
      navigateTo("/login");
    } catch (err) {
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e?.statusCode ?? e?.status;
      if (status === 400) {
        setError("This reset link is invalid or has expired. Please request a new one.");
      } else {
        setError(e?.message || "Password reset failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-surface justify-between">
      <AuthNavbar />
      <main className="flex-1 flex items-center justify-center w-full max-w-md mx-auto px-4 py-12">
        <div className="w-full bg-surface-card border border-neutral-200 rounded-sm p-8 shadow-sm">

          {recoveryStep === 1 && (
            <>
              <h2 className="text-2xl font-800 font-headline text-tertiary-500 text-center tracking-tight">Reset Password</h2>
              <p className="text-xs sm:text-sm font-body text-neutral-600 text-center mt-2 mb-6">
                Enter your registered email address to begin recovery.
              </p>
              <form onSubmit={handleStepOneSubmit} className="space-y-4">
                <AuthInput label="Email Address" id="recovery-email" type="email" placeholder="name@institution.edu.ng"
                  iconName="mail" value={emailAddress}
                  onChange={(e) => { setEmailAddress(e.target.value); if (error) setError(""); }} required />
                {error && <p className="text-xs font-600 text-red-500 font-body">{error}</p>}
                <button type="submit" disabled={isLoading}
                  className="w-full justify-center py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-600 text-sm inline-flex items-center gap-2 transition-colors rounded-sm">
                  {isLoading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Recovery Link"}
                </button>
              </form>
            </>
          )}

          {recoveryStep === 2 && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto">
                <MailCheck size={24} />
              </div>
              <h2 className="text-xl font-800 font-headline text-tertiary-500 tracking-tight">Check Your Inbox</h2>
              <p className="text-sm font-body text-neutral-600 max-w-xs mx-auto leading-relaxed">
                A secure reset link was sent to{" "}
                <strong className="text-neutral-800">{emailAddress || "your inbox"}</strong>.
              </p>
            </div>
          )}

          {recoveryStep === 3 && (
            <>
              <h2 className="text-2xl font-800 font-headline text-tertiary-500 text-center tracking-tight mb-2">Update Password</h2>
              <p className="text-xs sm:text-sm font-body text-neutral-600 text-center mb-6">Enter and confirm your new password below.</p>
              <form onSubmit={handleStepThreeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="new-pass" className="text-sm font-700 text-neutral-700 block font-body">New Password</label>
                  <div className="relative flex items-center">
                    <KeyRound size={16} className="absolute left-4 text-neutral-500 pointer-events-none" />
                    <input id="new-pass" type={showPass ? "text" : "password"} placeholder="••••••••"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                      className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm pl-11 pr-10 py-3" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 text-neutral-500 hover:text-neutral-700 focus:outline-none">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirm-new-pass" className="text-sm font-700 text-neutral-700 block font-body">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-4 text-neutral-500 pointer-events-none" />
                    <input id="confirm-new-pass" type={showConfirmPass ? "text" : "password"} placeholder="••••••••"
                      value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required
                      className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm pl-11 pr-10 py-3" />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 text-neutral-500 hover:text-neutral-700 focus:outline-none">
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {(matchError || error) && <p className="text-xs font-600 text-red-500 font-body">{matchError || error}</p>}
                <button type="submit" disabled={isLoading}
                  className="w-full justify-center py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-600 text-sm inline-flex items-center gap-2 transition-colors rounded-sm">
                  {isLoading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <div className="w-full py-4 text-center text-xs font-body text-neutral-500 border-t border-neutral-200 bg-surface-card">
        Need assistance?{" "}
        <a href="#support" className="text-primary-500 font-600 hover:underline">Contact Support</a>
      </div>
    </div>
  );
}