import Trcn from "../../assets/images/trcn.jpg";
import Ancopps from "../../assets/images/ancopps.jpg";
import TedPrime from "../../assets/images/tedprime.png";
import Napps from "../../assets/images/napps.jpg";

interface Endorser {
  name: string;
  logo: string;
}

const endorsers: Endorser[] = [
  { name: "TRCN", logo: Trcn },
  { name: "ANCOPPS", logo: Ancopps },
  { name: "NAPPS", logo: Napps },
  { name: "TedPrime Hub", logo: TedPrime },
];

export default function TrustBar() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-8xl mx-auto px-6">
        <p className="text-center text-xs font-label font-semibold uppercase tracking-[0.2em] text-neutral-900 mb-10">
          Endorsed &amp; Trusted By
        </p>

        {/* horizontal scroll on mobile, normal flex on md+ */}
        <div className="flex overflow-x-auto md:overflow-x-visible md:flex-wrap md:justify-between items-center gap-10 md:gap-16 max-w-4xl mx-auto pb-2 md:pb-0 scrollbar-hide">
          {endorsers.map((org) => (
            <div
              key={org.name}
              className="flex flex-col items-center gap-3 shrink-0 md:shrink"
            >
              <img
                src={org.logo}
                alt={org.name}
                className="h-16 md:h-20 w-auto object-contain"
              />
              <span className="font-label font-semibold text-sm text-tertiary-500 whitespace-nowrap">
                {org.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
