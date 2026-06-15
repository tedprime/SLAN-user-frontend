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
      "Shift from classroom practitioner to strategic school leader. Build the mindset, vocabulary, and decision-making habits that define effective Nigerian administrators.",
    modules: 3,
    units: 15,
  },
  {
    number: 2,
    icon: <BookOpen size={25} />,
    title: "Academic and Instructional Leadership",
    description:
      "Lead learning at scale. Master instructional supervision, curriculum alignment, and the data-driven routines that lift student outcomes across every classroom.",
    modules: 3,
    units: 15,
  },
  {
    number: 3,
    icon: <Building2 size={25} />,
    title: "School Administration and Operations",
    description:
      "Run a school that runs itself. Cover financial management, statutory records, UBEC compliance, and the governance structures that keep institutions audit-ready.",
    modules: 3,
    units: 15,
  },
  {
    number: 4,
    icon: <Users size={25} />,
    title: "People, Culture and Community",
    description:
      "Build the team behind the results. Learn staff motivation, conflict resolution, parent engagement, and how to shape a professional learning culture from the inside out.",
    modules: 3,
    units: 15,
  },
  {
    number: 5,
    icon: <BarChart3 size={25} />,
    title: "Safety, Crisis and Environment",
    description:
      "Lead with confidence when it matters most. Develop school safety protocols, crisis response plans, and the environmental standards that protect every learner.",
    modules: 3,
    units: 15,
  },
  {
    number: 6,
    icon: <Link2 size={25} />,
    title: "Technology and Innovation",
    description:
      "Future-proof your school. Integrate EdTech tools, manage digital learning environments, and cultivate external partnerships that expand your institution's reach.",
    modules: 3,
    units: 15,
  },
  {
    number: 7,
    icon: <GraduationCap size={25} />,
    title: "Private School Leadership",
    description:
      "Apply everything in a real-world capstone. Design and present a school improvement project that demonstrates full programme mastery and earns your certification.",
    modules: 3,
    units: 15,
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

        {/* Track cards grid — items-stretch ensures all cards in a row share equal height */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {tracks.map((track, i) => (
            <TrackCard key={track.number} track={track} delay={i * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}
