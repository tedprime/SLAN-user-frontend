import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { Loader2, BadgeCheck, X, AlertCircle } from "lucide-react";
import AuthNavbar from "../components/layout/AuthNavbar";
import AuthFooter from "../components/layout/AuthFooter";
import { authService } from "../services/authService";
import { setTokens, setUser } from "../services/tokenService";

interface GoogleTempTokenPayload {
  googleId: string;
  email: string;
  fullName?: string;
  phone?: string;
}

// Normalized user shape — backend might return `name` instead of `fullName`
interface GoogleUserResponse {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

// ── Inline Toast Component ──────────────────────────────────────────────────
function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        maxWidth: "380px",
        width: "calc(100vw - 48px)",
        backgroundColor: "#fff",
        border: "1px solid #fca5a5",
        borderLeft: "4px solid #ef4444",
        borderRadius: "6px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px",
        animation: "slideInRight 0.25s ease",
      }}
    >
      <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0, marginTop: "1px" }} />
      <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5", flex: 1, margin: 0 }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "#9ca3af",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={16} />
      </button>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
function navigateTo(path: string, replace = false) {
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
  window.dispatchEvent(new Event("popstate"));
}

export default function GoogleCompletePage() {  // Parse URL params once, synchronously
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const accessToken      = params.get("accessToken");
  const refreshToken     = params.get("refreshToken");
  const userRaw          = params.get("user");
  const incomingTempToken = params.get("tempToken");
  const errorParam       = params.get("error"); // backend sends ?error=... on conflicts

  // ── Determine initial state ─────────────────────────────────────────────
  type Status = "loading" | "form" | "error" | "toast_then_redirect";

  let initialStatus: Status = "loading";
  let initialEmail    = "";
  let initialFullName = "";
  let initialPhone    = "";
  let initialToastMsg = "";

  // Pure computation only — no side effects here. The actual token storage
  // and redirect for this case happens in a useEffect further down, once
  // the component has actually mounted. Doing it here in the render body
  // used to fire a synthetic "popstate" event synchronously *during*
  // React's render pass, which raced with App.tsx's own render and could
  // silently drop the navigation — that was the cause of needing to click
  // "Sign in with Google" twice.
  let normalizedUser: { id: string; fullName: string; email: string; role: string } | null = null;
  if (accessToken && refreshToken) {
    let parsedUser: GoogleUserResponse | null = null;
    if (userRaw) {
      try {
        parsedUser = JSON.parse(decodeURIComponent(userRaw));
      } catch { /* ignore */ }
    }
    normalizedUser = parsedUser
      ? {
          id: parsedUser.id ?? "",
          fullName: (parsedUser.fullName ?? parsedUser.name) || "User",
          email: parsedUser.email ?? "",
          role: parsedUser.role ?? "teacher",
        }
      : null;
  }

  if (errorParam) {
    initialToastMsg = errorParam.includes("already exists")
      ? "An account with this Google account already exists. Please log in instead."
      : decodeURIComponent(errorParam);
    initialStatus = "toast_then_redirect";
  } else if (accessToken && refreshToken) {
    // Fully authenticated (Google login success) — status stays "loading"
    // while the useEffect below stores tokens and redirects.
  } else if (incomingTempToken) {
    try {
      const decoded = jwtDecode<GoogleTempTokenPayload>(incomingTempToken);
      initialEmail    = decoded.email;
      initialFullName = decoded.fullName ?? "";
      initialPhone    = decoded.phone    ?? "";
      initialStatus   = "form";
    } catch {
      initialToastMsg = "That sign-in link is invalid or has expired.";
      initialStatus   = "toast_then_redirect";
    }
  } else {
    initialToastMsg = "We couldn't complete Google sign-in. Please try again.";
    initialStatus   = "toast_then_redirect";
  }

  // ── State ───────────────────────────────────────────────────────────────
  const [status]     = useState<Status>(initialStatus);
  const [toastMsg]   = useState(initialToastMsg);
  const [showToast, setShowToast] = useState(initialStatus === "toast_then_redirect");
  const [email]      = useState(initialEmail);
  const [fullName,  setFullName]  = useState(initialFullName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [tempToken]  = useState(incomingTempToken ?? "");

  // Form fields
  const [currentRole,    setCurrentRole]    = useState("principal");
  const [stateRegion,    setStateRegion]    = useState("Lagos");
  const [schoolName,     setSchoolName]     = useState("");
  const [schoolLocation, setSchoolLocation] = useState("Urban");
  const [schoolType,     setSchoolType]     = useState("Private");
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [errorMsg,       setErrorMsg]       = useState("");

  // Store tokens and redirect to the dashboard — done here, in an effect
  // that runs once after mount, rather than in the render body. A ref
  // guard (not the dependency array) enforces "exactly once," since
  // accessToken/refreshToken/normalizedUser are freshly computed each
  // render and aren't stable references to depend on.
  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (!(accessToken && refreshToken)) return;
    hasRedirectedRef.current = true;
    setTokens({ accessToken, refreshToken });
    if (normalizedUser) setUser(normalizedUser);
    navigateTo("/dashboard", true);
  });

  // Auto-redirect after toast for error states
  useEffect(() => {
    if (status !== "toast_then_redirect") return;
    const t = setTimeout(() => {
      setShowToast(false);
      const dest = toastMsg.includes("log in instead") ? "/login" : "/signup";
      navigateTo(dest, true);
    }, 5000);
    return () => clearTimeout(t);
  }, [status, toastMsg]);

  const NIGERIAN_STATES = [
    "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
    "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe",
    "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
    "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
    "Taraba","Yobe","Zamfara",
  ];

  const backendLocationMap: Record<string, string> = {
    Urban: "urban", "Semi-Urban": "semi_urban", Rural: "rural",
  };
  const backendTypeMap: Record<string, string> = {
    Private: "private", Public: "public",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const result = await authService.completeGoogleSignup({
        tempToken,
        fullName,
        phone: formatPhone(phoneNumber),
        role: currentRole,
        state: stateRegion,
        schoolName,
        schoolLocation: backendLocationMap[schoolLocation] ?? "urban",
        schoolType: backendTypeMap[schoolType] ?? "private",
      });

      // ── FIX #1: Defensive normalization of the response ──────────────
      // The backend might return the user with `name` instead of `fullName`
      const rawUser = (result as unknown as { user?: GoogleUserResponse }).user;
      const normalizedUser = rawUser
        ? {
            id: rawUser.id ?? "",
            fullName: (rawUser.fullName ?? rawUser.name ?? fullName) || "User",
            email: rawUser.email ?? email,
            role: rawUser.role ?? currentRole,
          }
        : {
            id: "",
            fullName: fullName || "User",
            email,
            role: currentRole,
          };

      setTokens(result);
      setUser(normalizedUser);

      // Google signup complete — go straight to dashboard, no OTP needed
      navigateTo("/dashboard", true);
    } catch (err) {
      const e = err as { message?: string };
      setErrorMsg(e?.message || "Couldn't finish setting up your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("234")) return `+${digits}`;
    if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
    if (digits.startsWith("7") || digits.startsWith("8") || digits.startsWith("9")) return `+234${digits}`;
    return raw;
  }

  // ── Render: loading ─────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4">
        <Loader2 size={32} className="animate-spin text-primary-500" />
        <p className="text-sm font-body text-neutral-600">Completing sign in...</p>
      </div>
    );
  }

  // ── Render: toast + redirect (no full error screen) ─────────────────────
  if (status === "toast_then_redirect") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4 px-4 text-center">
        {showToast && (
          <Toast message={toastMsg} onClose={() => setShowToast(false)} />
        )}
        <p className="text-xs font-body text-neutral-400">
          {toastMsg.includes("log in instead")
            ? "Redirecting you to login..."
            : "Redirecting you to sign up..."}
        </p>
      </div>
    );
  }

  // ── Render: profile completion form (Step 2 equivalent for Google) ──────
  return (
    <div className="min-h-screen w-full flex flex-col bg-surface">
      {showToast && (
        <Toast message={toastMsg} onClose={() => setShowToast(false)} />
      )}

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
            {/* Full name — prefilled from Google */}
            <div>
              <label className="block text-sm font-700 text-neutral-700 mb-1.5 font-body">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm px-4 py-3"
              />
            </div>

            {/* Phone — prefilled if Google provided it */}
            <div>
              <label className="block text-sm font-700 text-neutral-700 mb-1.5 font-body">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="e.g. 08012345678"
                className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm px-4 py-3"
              />
            </div>

            {/* Role + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-700 text-neutral-700 font-body">
                  Current Role
                </label>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
                >
                  <option value="teacher">Teacher</option>
                  <option value="principal">Principal</option>
                  <option value="vice_principal">Vice Principal</option>
                  <option value="head_teacher">Head Teacher</option>
                  <option value="proprietor">School Proprietor</option>
                  <option value="aspiring_head">Aspiring School Head</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-700 text-neutral-700 font-body">
                  State
                </label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* School location + type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-700 text-neutral-700 font-body">
                  School Location
                </label>
                <select
                  value={schoolLocation}
                  onChange={(e) => setSchoolLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
                >
                  <option value="Urban">Urban</option>
                  <option value="Semi-Urban">Semi-Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-700 text-neutral-700 font-body">
                  School Type
                </label>
                <select
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
                >
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                </select>
              </div>
            </div>

            {/* School name */}
            <div>
              <label className="block text-sm font-700 text-neutral-700 mb-1.5 font-body">
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                placeholder="Enter your school/institution name"
                className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm px-4 py-3"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-600 text-red-500 font-body">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-600 text-sm inline-flex items-center gap-2 transition-colors rounded-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <BadgeCheck size={16} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
}
