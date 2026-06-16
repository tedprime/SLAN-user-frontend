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
import GoogleCallbackPage from "./pages/GoogleCallbackPage";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

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
    case "/auth/google/callback": return <GoogleCallbackPage />;
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