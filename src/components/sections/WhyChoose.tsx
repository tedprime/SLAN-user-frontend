import Image1 from "../../assets/images/image-1.jpg";
import Image2 from "../../assets/images/image-2.jpg";
import FeatureCard from "../ui/FeatureCard";
import { Gavel, Clock, Globe } from "lucide-react";

const features = [
  {
    id: "nigeria-specific",
    icon: <Gavel className="w-8 h-8 sm:w-9 sm:h-9 text-primary-500" />,
    title: "Nigeria-Specific by Design",
    description:
      "Every module is written against Nigerian policy, Nigerian law, and Nigerian school realities. We address UBEC, TRCN, WAEC, and state ministry requirements directly.",
    tags: ["Lagos & Abuja Policy", "SUBEB Standards", "TRCN CPD Points"],
    variant: "light" as const,
  },
  {
    id: "learn",
    icon: <Clock className="w-8 h-8 sm:w-9 sm:h-9 text-white" />,
    title: "Learn At Your Own Pace",
    description:
      "No fixed schedules. Study during free periods, weekends, or holidays. Pick up exactly where you left off, on any device",
    badge: "Study anytime, anywhere",
    variant: "dark" as const,
  },
  {
    id: "network",
    icon: <Globe className="w-8 h-8 sm:w-9 sm:h-9 text-primary-500" />,
    title: "Global Network, Local Expertise",
    description:
      "Access a peer mentorship network that outlives the programme itself, featuring retired principals and sector experts.",
    cta: { label: "Explore the Community →", href: "#community" },
    image: Image2,
    variant: "split" as const,
  },
];

export default function WhyChoose() {
  return (
    <section id="about" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2
            className="font-headline font-bold text-primary-500 mb-3 leading-tight"
            style={{ fontSize: "clamp(1.75rem, 4vw, var(--text-display-md))" }}
          >
            Why Choose SLAN Online?
          </h2>
          <p className="font-body text-neutral-500 text-base sm:text-lg max-w-2xl mx-auto">
            Built specifically for the Nigerian educational landscape
          </p>
        </div>

        {/* Grid: single column on mobile, complex layout on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* Card 1: Nigeria-Specific - full width on mobile, spans 2 cols on lg */}
          <div className="lg:col-span-2 flex">
            <FeatureCard feature={features[0]} className="flex-1 w-full" />
          </div>

          {/* Card 2: Offline Resilience - full width on mobile, 1 col on lg */}
          <div className="lg:col-span-1 flex">
            <FeatureCard feature={features[1]} className="flex-1 w-full" />
          </div>

          {/* Image block - full width on mobile, 1 col on lg, appears 3rd in flow */}
          <div className="lg:col-span-1 h-64 sm:h-80 lg:h-auto rounded-xl sm:rounded-2xl overflow-hidden">
            <img
              src={Image1}
              alt="Nigerian educators collaborating"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card 3: Global Network - full width on mobile, spans 2 cols on lg */}
          <div className="lg:col-span-2 flex">
            <FeatureCard
              feature={features[2]}
              className="flex-1 w-full p-5 sm:p-6 bg-neutral-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}