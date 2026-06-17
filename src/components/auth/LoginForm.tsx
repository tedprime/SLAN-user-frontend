import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthInput from "../ui/AuthInput";
import { authService } from "../../services/authService";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.055 14.98 0 12 0 7.354 0 3.307 2.69 1.299 6.614l3.967 3.151z" />
      <path fill="#4285F4" d="M23.49 12.275c0-.796-.073-1.564-.205-2.304H12v4.358h6.443a5.504 5.504 0 01-2.386 3.614l3.714 2.878c2.173-2.002 3.429-4.945 3.429-8.542z" />
      <path fill="#FBBC05" d="M5.266 14.235L1.3 17.386A11.947 11.947 0 010 12c0-1.923.455-3.743 1.299-5.386l3.967 3.151A7.031 7.031 0 005.143 12c0 .787.13 1.543.123 2.235z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.956-1.075 7.942-2.916l-3.714-2.878c-1.03.69-2.343 1.103-4.228 1.103-3.23 0-5.964-2.182-6.939-5.114L1.095 17.34A11.956 11.956 0 0012 24z" />
    </svg>
  );
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigateTo = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authService.login({ email, password });
      navigateTo(`/verify-otp?flow=login&email=${encodeURIComponent(email)}`);
    } catch (err) {
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e?.statusCode ?? e?.status;
      if (status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (status === 403) {
        setError("Your email address has not been verified. Please check your inbox.");
      } else {
        setError(e?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Integrated logic with visual loaders and UI feedback intact
  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const { url } = await authService.getGoogleLoginUrl();
      window.location.replace(url);
    } catch (err) {
      console.error("Failed to get Google login URL:", err);
      setError("Could not initiate Google sign in. Please try again.");
      setIsGoogleLoading(false); // Resets loading state so users can retry if it fails
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <AuthInput
        label="Email Address"
        id="login-email"
        type="email"
        placeholder="example@email.com"
        iconName="mail"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
        required
      />

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="login-password" className="text-sm font-700 text-neutral-700 block font-body">
            Password
          </label>
          <a
            href="/forgot-password"
            onClick={(e) => navigateTo("/forgot-password", e)}
            className="text-xs font-600 font-body text-primary-500 hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative flex items-center">
          <Lock size={16} className="absolute left-4 text-neutral-500 pointer-events-none" />
          <input
            id="login-password"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
            required
            className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm pl-11 pr-10 py-3"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 flex items-center text-neutral-500 hover:text-neutral-700 focus:outline-none"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && <p className="text-xs font-600 text-red-500 font-body -mt-2">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full justify-center py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-600 text-sm transition-colors rounded-sm flex items-center gap-2"
      >
        {isLoading ? <><Loader2 size={16} className="animate-spin" /> Sending OTP...</> : "Get Access OTP"}
      </button>

      <div className="relative flex py-2 items-center">
        <div className="flex-1 border-t border-neutral-200" />
        <span className="mx-4 text-xs font-600 font-body text-neutral-500">or</span>
        <div className="flex-1 border-t border-neutral-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full py-3 px-4 border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed text-neutral-700 text-sm font-600 font-body transition-colors flex items-center justify-center gap-3 focus:outline-none rounded-sm"
      >
        {isGoogleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
        {isGoogleLoading ? "Redirecting..." : "Sign In with Google"}
      </button>

      <div className="pt-2 text-center">
        <p className="text-sm font-body text-neutral-700">
          New to the platform?{" "}
          <a href="/signup" onClick={(e) => navigateTo("/signup", e)} className="text-primary-500 font-700 hover:underline ms-1">
            Create an account
          </a>
        </p>
      </div>
    </form>
  );
}