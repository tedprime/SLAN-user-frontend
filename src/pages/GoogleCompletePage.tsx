import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Loader2, BadgeCheck } from "lucide-react";
import AuthNavbar from "../components/layout/AuthNavbar";
import AuthFooter from "../components/layout/AuthFooter";
import Button from "../components/ui/Button";
import { authService } from "../services/authService";
import { setTokens, setUser } from "../services/tokenService";

interface GoogleTempTokenPayload {
  googleId: string;
  email: string;
  fullName?: string;
}

export default function GoogleCompletePage() {
  // Helper to handle custom routing mechanism
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // 1. Parse URL params and decode initial values safely before rendering
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const userRaw = params.get("user");
  const incomingTempToken = params.get("tempToken");

  let initialStatus: "loading" | "form" | "error" = "loading";
  let initialEmail = "";
  let initialFullName = "";
  let initialErrorMsg = "";

  // Synchronous, immediate processing of URL parameters on script load
  if (accessToken && refreshToken) {
    setTokens({ accessToken, refreshToken });
    if (userRaw) {
      try {
        setUser(JSON.parse(decodeURIComponent(userRaw)));
      } catch {
        /* ignore malformed payload */
      }
    }
    navigateTo("/dashboard");
  } else if (incomingTempToken) {
    try {
      const decoded = jwtDecode<GoogleTempTokenPayload>(incomingTempToken);
      initialEmail = decoded.email;
      initialFullName = decoded.fullName ?? "";
      initialStatus = "form";
    } catch {
      initialErrorMsg = "That sign-in link is invalid or has expired.";
      initialStatus = "error";
    }
  } else {
    initialErrorMsg = "We couldn't complete Google sign-in. Please try again.";
    initialStatus = "error";
  }

  // 2. State hooks initialized with the pre-calculated values
  const [status] = useState(initialStatus);
  const [errorMsg, setErrorMsg] = useState(initialErrorMsg);
  const [email] = useState(initialEmail);
  const [fullName, setFullName] = useState(initialFullName);
  const [tempToken] = useState(incomingTempToken ?? "");

  // Form states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentRole, setCurrentRole] = useState("principal");
  const [stateRegion, setStateRegion] = useState("Lagos");
  const [schoolName, setSchoolName] = useState("");
  const [schoolLocation, setSchoolLocation] = useState("Urban");
  const [schoolType, setSchoolType] = useState("Private");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Keep effect ONLY for asynchronous side-effects (like the timeout redirect)
  useEffect(() => {
    if (status !== "error") return;
    const t = setTimeout(() => navigateTo("/login"), 3000);
    return () => clearTimeout(t);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const result = await authService.completeGoogleSignup({
        tempToken,
        fullName,
        phone: phoneNumber,
        role: currentRole,
        state: stateRegion,
        schoolName,
        schoolLocation,
        schoolType,
      });
      setTokens(result);
      setUser(result.user);
      navigateTo("/dashboard");
    } catch (err) {
      const e = err as { message?: string };
      setErrorMsg(e?.message || "Couldn't finish setting up your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4">
        <Loader2 size={32} className="animate-spin text-primary-500" />
        <p className="text-sm font-body text-neutral-600">Completing sign in...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4 px-4 text-center">
        <p className="text-sm font-body text-neutral-600">{errorMsg}</p>
        <p className="text-xs font-body text-neutral-400">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-surface">
      <AuthNavbar />
      <div className="flex-1 w-full flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="max-w-xl w-full bg-surface-card border border-neutral-200 rounded-sm p-8 sm:p-10 shadow-sm">
          <div className="mb-8 text-center">
            <h2 className="text-[28px] font-800 font-headline text-tertiary-500 tracking-tight leading-none">
              Almost there
            </h2>
            <p className="text-sm font-body text-neutral-600 mt-3 leading-relaxed">
              Signed in as <strong className="text-neutral-700">{email}</strong>. Just a few more details to finish setting up your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-600 font-label text-neutral-700 mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm font-body focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-600 font-label text-neutral-700 mb-1.5">Phone number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm font-body focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-600 font-label text-neutral-700 mb-1.5">Role</label>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm font-body focus:outline-none focus:border-primary-500"
                >
                  <option value="principal">Principal</option>
                  <option value="teacher">Teacher</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 font-label text-neutral-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm font-body focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 font-label text-neutral-700 mb-1.5">School name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm font-body focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-600 font-label text-neutral-700 mb-1.5">School location</label>
                <select
                  value={schoolLocation}
                  onChange={(e) => setSchoolLocation(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm font-body focus:outline-none focus:border-primary-500"
                >
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 font-label text-neutral-700 mb-1.5">School type</label>
                <select
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm font-body focus:outline-none focus:border-primary-500"
                >
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                </select>
              </div>
            </div>

            {errorMsg && <p className="text-xs font-600 text-red-500 font-body">{errorMsg}</p>}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 rounded-sm flex items-center gap-2 text-sm font-600 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <BadgeCheck size={16} />
                  <span>Finish signing up</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}