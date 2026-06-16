import HeroImage from "../../assets/images/hero-image.png";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { ShieldCheck } from "lucide-react";

interface HeroProps {
  onOpenOverlay: () => void;
}

export default function Hero({ onOpenOverlay }: HeroProps) {
  return (
    <section className="relative bg-neutral-100 overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex items-center">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary-500) 1px, transparent 0)`,
          backgroundSize: "24px 24px sm:32px 32px",
        }}
      />

      {/* Abstract background skew shape */}
      <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-full bg-primary-500/5 -skew-x-12 transform translate-x-20" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left – Copy */}
          <div className="space-y-4 sm:space-y-5 text-center lg:text-left order-2 lg:order-1">
            <div className="flex justify-center lg:justify-start">
              <Badge color="initiative" className="mb-2 sm:mb-4">
                National Leadership Initiative
              </Badge>
            </div>

            <h1
              className="font-headline font-bold text-primary-500 leading-[1.1] sm:leading-tight"
              style={{ fontSize: "clamp(2rem, 5vw, var(--text-display-lg))" }}
            >
              Empowering Nigeria's Future School Leaders
            </h1>

            <p className="font-body text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              A structured, evidence-based leadership pathway-paced and Online
              Certification Course for serving and aspiring principals,
              headteachers, proprietors and Quality Assurance Education Officers
              in Nigeria.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                onClick={onOpenOverlay}
                className="w-full sm:w-auto justify-center"
              >
                Enroll
              </Button>
              <Button
                variant="outlined"
                size="lg"
                href="#curriculum"
                className="w-full sm:w-auto justify-center"
              >
                View 7-Track Curriculum
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 pt-4 text-neutral-500">
              <ShieldCheck
                fill="green"
                color="white"
                size={20}
                className="sm:w-[22px] sm:h-[22px]"
              />
              <span className="text-xs sm:text-sm font-body">
                Acknowledged by TRCN &amp; ANCOPPS
              </span>
            </div>
          </div>

          {/* Right – Image + floating cards */}
          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-md sm:max-w-lg bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl">
              <img
                src={HeroImage}
                alt="Nigerian educators collaborating"
                className="w-full object-cover object-top rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl"
                style={{ height: "clamp(300px, 50vw, 460px)" }}
              />

              {/* Floating stat card */}
              <div className="absolute -bottom-4 sm:-bottom-6 -left-3 sm:-left-6 bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-5 py-3 sm:py-5 px-4 sm:px-6 min-w-[7rem] sm:min-w-40 z-10">
                <p
                  className="font-headline font-bold text-yellow-800 leading-none text-center"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
                >
                  3x
                </p>
                <p className="text-[0.65rem] sm:text-xs text-neutral-700 font-semibold mt-1 sm:mt-2 font-body leading-tight">
                  Career advancement rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}