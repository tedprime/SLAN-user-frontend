import { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import WhyChoose from "./components/sections/WhyChoose";
import SevenTracks from "./components/sections/SevenTracks";
import CTABanner from "./components/sections/CTABanner";
import TrustBar from "./components/sections/TrustBar";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  switch (currentPath) {
    case "/login":
      return <LoginPage />;
    case "/signup":
      return <SignUpPage />;
    case "/verify-otp":
      return <OtpPage />;
    case "/forgot-password":
      return <ForgotPasswordPage />;
    // ↓ Handle the reset link your backend emails out
    case "/reset-password":
      return <ForgotPasswordPage />;
    default:
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Hero />
            <WhyChoose />
            <SevenTracks />
            <CTABanner />
            <TrustBar />
          </main>
          <Footer />
        </div>
      );
  }
}