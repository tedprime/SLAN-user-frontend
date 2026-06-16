import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { setTokens, setUser } from "../services/tokenService";

export default function GoogleCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userRaw = params.get("user");
    const tempToken = params.get("tempToken");

    const navigateTo = (path: string) => {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new Event("popstate"));
    };

    if (accessToken && refreshToken) {
      setTokens({ accessToken, refreshToken });
      if (userRaw) {
        try {
          setUser(JSON.parse(decodeURIComponent(userRaw)));
        } catch {
          // ignore
        }
      }
      navigateTo("/dashboard");
      return;
    }

    if (tempToken) {
      navigateTo(`/google-complete?tempToken=${tempToken}`);
      return;
    }

    setTimeout(() => navigateTo("/login"), 3000);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4">
      <Loader2 size={32} className="animate-spin text-primary-500" />
      <p className="text-sm font-body text-neutral-600">Completing sign in...</p>
    </div>
  );
}