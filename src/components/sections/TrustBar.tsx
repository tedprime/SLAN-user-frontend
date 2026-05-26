import Trcn from "../../assets/images/trcn.jpg";
import Ancopps from "../../assets/images/ancopps.jpg";
import TedPrime from "../../assets/images/tedprime.png";
import Napps from "../../assets/images/napps.jpg";

interface Endorser {
  name: string;
  logo: string;
  scale: string;
}

const endorsers: Endorser[] = [
  { name: "TRCN", logo: Trcn, scale: "scale-100" },
  { name: "ANCOPPS", logo: Ancopps, scale: "scale-125" },
  { name: "NAPPS", logo: Napps, scale: "scale-125" },
  { name: "TedPrime Hub", logo: TedPrime, scale: "scale-110" },
];

export default function TrustBar() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm font-label font-semibold uppercase tracking-[0.2em] text-neutral-900 mb-8 sm:mb-10">
          Endorsed &amp; Trusted By
        </p>

        <div className="flex overflow-x-auto sm:overflow-x-visible sm:grid sm:grid-cols-4 items-center gap-8 sm:gap-12 lg:gap-16 max-w-5xl mx-auto pb-4 sm:pb-0 scrollbar-hide">
          {endorsers.map((org) => (
            <div
              key={org.name}
              className="flex flex-col items-center gap-3 sm:gap-4 shrink-0 sm:shrink"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center overflow-hidden">
                <img
                  src={org.logo}
                  alt={org.name}
                  className={`w-full h-full object-contain ${org.scale}`}
                />
              </div>
              <span className="font-label font-semibold text-sm lg:text-base text-tertiary-500 whitespace-nowrap">
                {org.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
