import { Landmark, GraduationCap, Users, Network } from "lucide-react";

interface Endorser {
  name: string;
  icon: React.ReactNode;
  hoverColor: string;
}

const endorsers: Endorser[] = [
  {
    name: "TRCN",
    icon: <Landmark className="w-10 h-10 transition-colors duration-200" />,
    hoverColor: "group-hover:text-secondary-500",
  },
  {
    name: "ANCOPPS",
    icon: (
      <GraduationCap className="w-10 h-10 transition-colors duration-200" />
    ),
    hoverColor: "group-hover:text-primary-500",
  },
  {
    name: "NAPPS",
    icon: <Users className="w-10 h-10 transition-colors duration-200" />,
    hoverColor: "group-hover:text-secondary-500",
  },
  {
    name: "TedPrime Hub",
    icon: <Network className="w-10 h-10 transition-colors duration-200" />,
    hoverColor: "group-hover:text-primary-500",
  },
];

export default function TrustBar() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-8xl mx-auto px-6">
        <p className="text-center text-xs font-label font-semibold uppercase tracking-[0.2em] text-neutral-900 mb-10">
          Endorsed &amp; Trusted By
        </p>

        <div className="group flex flex-wrap items-center justify-between gap-10 md:gap-16 max-w-4xl mx-auto">
          {endorsers.map((org) => (
            <div
              key={org.name}
              className="group flex flex-col items-center gap-2 opacity-50 font-semibold transition-opacity duration-200 cursor-pointer"
            >
              <span
                className={`text-neutral-600 font-semibold ${org.hoverColor}`}
              >
                {org.icon}
              </span>
              <span className="font-label font-600 text-sm text-tertiary-500">
                {org.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
