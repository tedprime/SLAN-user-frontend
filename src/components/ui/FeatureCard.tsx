import React from "react";

interface CTA {
  href: string;
  label: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags?: string[];
  badge?: string;
  cta?: CTA;
  image?: string;
  variant?: "dark" | "split" | "light";
}

interface FeatureCardProps {
  feature: Feature;
  className?: string;
}

export default function FeatureCard({
  feature,
  className = "",
}: FeatureCardProps) {
  const { icon, title, description, tags, badge, cta, image, variant } =
    feature;

  /* ── Dark card ── */
  if (variant === "dark") {
    return (
      <div
        className={`bg-primary-500 text-white rounded-2xl p-8 flex flex-col gap-4 card-hover ${className}`}
      >
        <div className="w-10 h-10flex items-center justify-center text-lg">
          {icon}
        </div>
        <h3 className="font-headline font-bold text-xl text-white">{title}</h3>
        <p className="font-body text-base text-white leading-relaxed">
          {description}
        </p>
        {badge && (
          <div className="mt-auto">
            <div className="h-1.5 rounded-full bg-white/20 mb-3 mt-4 overflow-hidden">
              <div className="h-full w-3/5 bg-secondary-700 rounded-full" />
            </div>
            <span className="text-sm font-label font-600 text-white capitalize tracking-wider">
              {badge}
            </span>
          </div>
        )}
      </div>
    );
  }

  /* ── Split card ── */
  if (variant === "split") {
    return (
      <div
        className={`group bg-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 card-hover shadow-card ${className}`}
      >
        {/* Content first */}
        <div className="md:col-span-2 p-8 flex flex-col justify-center gap-4">
          <h3 className="font-headline font-bold text-xl text-neutral-800">
            {title}
          </h3>
          <p className="font-body text-base text-neutral-600 leading-relaxed">
            {description}
          </p>
          {cta && (
            <a
              href={cta.href}
              className="text-sm font-600 font-semibold font-body text-primary-500 hover:text-primary-dark transition-colors flex items-center gap-1"
            >
              {cta.label}
            </a>
          )}
        </div>

        {/* Image second */}
        <div className="bg-secondary-700 relative md:col-span-1 min-h-50 rounded-sm">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-full h-full rounded-sm object-cover absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          )}
        </div>
      </div>
    );
  }

  /* ── Light card (default) ── */
  return (
    <div
      className={`bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col gap-4 card-hover shadow-card ${className}`}
    >
      <div className="w-10 h-10 rounded-sm flex items-center justify-center text-lg">
        {icon}
      </div>
      <h3 className="font-headline font-bold text-xl text-neutral-800">
        {title}
      </h3>
      <p className="font-body text-base text-neutral-700 leading-relaxed">
        {description}
      </p>
      {tags && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-label font-semibold text-primary-400 px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
