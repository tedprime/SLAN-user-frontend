import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-neutral-100 overflow-hidden min-h-[90vh] flex items-center">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary-500) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Abstract background skew shape */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-500/5 -skew-x-12 transform translate-x-20" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left – Copy */}
        <div className="space-y-4">
          <Badge color="initiative" className="mb-6">
            National Leadership Initiative
          </Badge>

          <h1
            className="font-headline font-bold text-primary-500 leading-tight"
            style={{ fontSize: "var(--text-display-lg)" }}
          >
            Empowering Nigeria's Future Leaders
          </h1>

          <p className="font-body text-neutral-600 text-lg leading-relaxed max-w-xl">
            A structured, evidence-based leadership pathway for principals,
            headteachers, and proprietors. Convert your appointment letter into
            earned authority.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="primary" size="lg" href="#enroll">
              Start Enrollment →
            </Button>
            <Button variant="outlined" size="lg" href="#curriculum">
              View 7-Track Curriculum
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-4 text-neutral-500">
            <ShieldCheck fill="green" color="white" size={22} />
            <span className="text-sm font-body">
              Accredited by TRCN &amp; ANCOPPS
            </span>
          </div>
        </div>

        {/* Right – Image + floating cards */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg bg-white p-2 rounded-2xl">

            {/* Hero image */}
            <img
              src="../../../public/hero-image.png"
              alt="Nigerian educators collaborating"
              className="w-full object-cover object-top rounded-2xl shadow-2xl"
              style={{ height: "460px" }}
            />

            {/* Floating stat card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-5 py-7 px-6 min-w-40 z-10">
              <p
                className="font-headline font-bold text-yellow-800 leading-none"
                style={{ fontSize: "2.5rem" }}
              >
                65%
              </p>
              <p className="text-xs text-neutral-700 font-semibold mt-2 font-body leading-tight">
                Target completion rate
                <br />
                across all cohorts
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}