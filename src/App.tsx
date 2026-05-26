import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import WhyChoose from "./components/sections/WhyChoose";
import SevenTracks from "./components/sections/SevenTracks";
import CTABanner from "./components/sections/CTABanner";
import TrustBar from "./components/sections/TrustBar";

export default function App() {
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
