import { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import WhyChoose from "./components/sections/WhyChoose";
import SevenTracks from "./components/sections/SevenTracks";
import CTABanner from "./components/sections/CTABanner";
import TrustBar from "./components/sections/TrustBar";
import CourseDetailOverlay from "./components/ui/CourseDetailOverlay";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserDashboard from "./pages/dashboard/UserDashboard";
import GoogleCompletePage from "./pages/GoogleCompletePage";
import { setTokens, setUser } from "./services/tokenService";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // ── FIX: Handle auth tokens in URL query params ──
  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get("accessToken");
    const refreshToken = url.searchParams.get("refreshToken");
    const userParam = url.searchParams.get("user");

    if (accessToken && refreshToken) {
      // Store tokens
      setTokens({ accessToken, refreshToken });
      
      // Store user if present
      if (userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          setUser(user);
        } catch {
          // invalid user JSON, ignore
        }
      }

      // Clean URL (remove query params) without reloading
      url.searchParams.delete("accessToken");
      url.searchParams.delete("refreshToken");
      url.searchParams.delete("user");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    const handler = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOverlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOverlayOpen]);

  switch (currentPath) {
    case "/login":                return <LoginPage />;
    case "/signup":               return <SignUpPage />;
    case "/verify-otp":           return <OtpPage />;
    case "/forgot-password":      return <ForgotPasswordPage />;
    case "/reset-password":       return <ForgotPasswordPage />;
    case "/dashboard":            return <UserDashboard />;
    case "/auth/google/complete": return <GoogleCompletePage />;
    default:
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Hero onOpenOverlay={() => setIsOverlayOpen(true)} />
            <WhyChoose />
            <SevenTracks />
            <CTABanner onOpenOverlay={() => setIsOverlayOpen(true)} />
            <TrustBar />
          </main>
          <Footer />
          <CourseDetailOverlay
            isOpen={isOverlayOpen}
            onClose={() => setIsOverlayOpen(false)}
          />
        </div>
      );
  }
}