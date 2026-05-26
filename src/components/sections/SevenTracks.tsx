import TrackCard from "../ui/TrackCard";
import {
  Landmark,
  BookOpen,
  Building2,
  Users,
  BarChart3,
  Link2,
  GraduationCap,
} from "lucide-react";

const tracks = [
  {
    number: 1,
    icon: <Landmark size={25} />,
    title: "Foundational Leadership",
    description:
      "The mindset shift from teacher to administrator. Core frameworks for Nigerian school leaders.",
  },
  {
    number: 2,
    icon: <BookOpen size={25} />,
    title: "Academic Leadership",
    description:
      "Instructional supervision, curriculum alignment, and driving student outcomes at scale.",
  },
  {
    number: 3,
    icon: <Building2 size={25} />,
    title: "School Administration",
    description:
      "Financial management, statutory records, compliance, and governance structures.",
  },
  {
    number: 4,
    icon: <Users size={25} />,
    title: "People & Culture",
    description:
      "Staff motivation, community relations, and building a professional learning community.",
  },
  {
    number: 5,
    icon: <BarChart3 size={25} />,
    title: "Data & Performance",
    description:
      "Using school data for continuous improvement. Evidence-based decision making.",
  },
  {
    number: 6,
    icon: <Link2 size={25} />,
    title: "Stakeholder Engagement",
    description:
      "Parent and community relations, board management, and external partnerships.",
  },
  {
    number: 7,
    icon: <GraduationCap size={25} />,
    title: "The Capstone Project",
    description:
      "A school improvement project that demonstrates mastery and earns your certification.",
  },
];

export default function SevenTracks() {
  return (
    <section id="curriculum" className="bg-neutral-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <div>
            <h2
              className="font-headline font-bold text-primary-500 mb-2"
              style={{ fontSize: "var(--text-display-md)" }}
            >
              The Seven Tracks of Excellence
            </h2>
            <p className="font-body text-neutral-800 text-base">
              21 Modules. 105 Units. One complete leadership transformation.
            </p>
          </div>
          <a
            href="#curriculum-pdf"
            className="flex items-center font-semibold gap-2 text-sm font-600 font-body text-primary-500 
                       hover:text-primary-dark transition-colors whitespace-nowrap"
          >
            Download Full Curriculum PDF ⬇
          </a>
        </div>

        {/* Track cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tracks.map((track, i) => (
            <TrackCard key={track.number} track={track} delay={i * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}
