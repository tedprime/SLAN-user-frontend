import Trcn from "../../assets/images/trcn.jpg";
import Ancopps from "../../assets/images/ancopps.jpg";
import TedPrime from "../../assets/images/tedprime.png";
import Napps from "../../assets/images/napps.jpg";

interface Endorser {
  name: string;
  logo: string;
  isWordmark?: boolean;
}

const endorsers: Endorser[] = [
  { name: "TRCN", logo: Trcn },
  { name: "ANCOPPS", logo: Ancopps },
  { name: "NAPPS", logo: Napps },
  { name: "TedPrime Hub", logo: TedPrime, isWordmark: true },
];

export default function TrustBar() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm font-label font-semibold uppercase tracking-[0.2em] text-neutral-900 mb-8 sm:mb-10">
          Acknowledged &amp; Trusted By
        </p>

        <div className="flex overflow-x-auto sm:overflow-x-visible sm:grid sm:grid-cols-4 items-start gap-8 sm:gap-12 lg:gap-16 max-w-5xl mx-auto pb-4 sm:pb-0 scrollbar-hide">
          {endorsers.map((org) => (
            <div
              key={org.name}
              className="flex flex-col items-center gap-3 sm:gap-4 shrink-0 sm:shrink"
            >
              {/* Fixed-height container so all labels align at the same vertical position */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                {org.isWordmark ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
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
