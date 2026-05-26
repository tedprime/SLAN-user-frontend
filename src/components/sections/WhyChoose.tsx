import FeatureCard from "../ui/FeatureCard";
import { Gavel, Download, Globe } from "lucide-react";

const features = [
  {
    id: "nigeria-specific",
    icon: <Gavel className="w-9 h-9 text-primary-500" />,
    title: "Nigeria-Specific by Design",
    description:
      "Every module is written against Nigerian policy, Nigerian law, and Nigerian school realities. We address UBEC, TRCN, WAEC, and state ministry requirements directly.",
    tags: ["Lagos & Abuja Policy", "SUBEB Standards", "TRCN CPD Points"],
    variant: "light" as const,
  },
  {
    id: "offline",
    icon: <Download className="w-9 h-9 text-white" />,
    title: "Offline Resilience",
    description:
      "Designed for low-bandwidth areas. Download lessons and study for up to 14 days without an active internet connection.",
    badge: "Optimised for 240p video",
    variant: "dark" as const,
  },
  {
    id: "network",
    icon: <Globe className="w-9 h-9 text-primary-500" />,
    title: "Global Network, Local Expertise",
    description:
      "Access a peer mentorship network that outlives the programme itself, featuring retired principals and sector experts.",
    cta: { label: "Explore the Community  →", href: "#community" },
    image: "../../../public/image-2.jpg",
    variant: "split" as const,
  },
];

export default function WhyChoose() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="font-headline font-bold text-primary-500 mb-3"
            style={{ fontSize: "var(--text-display-md)" }}
          >
            Why Choose SLAN Online?
          </h2>
          <p className="font-body text-neutral-500 text-lg">
            Built specifically for the Nigerian educational landscape
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Row 1: light card spans 2 cols, dark card spans 1 — same height */}
          <div className="col-span-2 flex">
            <FeatureCard feature={features[0]} className="flex-1" />
          </div>
          <div className="col-span-1 flex">
            <FeatureCard feature={features[1]} className="flex-1" />
          </div>

          <div
            className="col-span-1
           rounded-2xl"
          >
            <img
              src="../../../public/image-1.jpg"
              alt="image"
              className="w-full h-full rounded-sm object-cover"
            />
          </div>
          <div className="col-span-2 flex">
            <FeatureCard
              feature={features[2]}
              className="flex-1 p-6 bg-neutral-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
