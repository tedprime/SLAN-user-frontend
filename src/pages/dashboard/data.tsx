import {
  Landmark, BookOpen, Building2, Users,
  BarChart3, Link2, GraduationCap,
} from "lucide-react";
import type { Track, ActivityItem } from "./index";

export const ALL_TRACKS: Omit<Track, "progress" | "status">[] = [
  {
    number: 1,
    icon: <Landmark size={18} />,
    title: "Foundational Leadership",
    description: "Build the strategic vision and ethical foundations every school leader needs.",
    modules: 3,
    units: 15,
  },
  {
    number: 2,
    icon: <BookOpen size={18} />,
    title: "Academic & Instructional Leadership",
    description: "Drive curriculum quality, teacher development, and learning outcomes.",
    modules: 3,
    units: 15,
  },
  {
    number: 3,
    icon: <Building2 size={18} />,
    title: "School Administration & Operations",
    description: "Master budgeting, compliance, facilities management, and daily operations.",
    modules: 3,
    units: 15,
  },
  {
    number: 4,
    icon: <Users size={18} />,
    title: "People, Culture & Community",
    description: "Lead teams effectively and build a thriving school culture and community.",
    modules: 3,
    units: 15,
  },
  {
    number: 5,
    icon: <BarChart3 size={18} />,
    title: "Safety, Crisis & Environment",
    description: "Prepare your school for emergencies and maintain a safe learning environment.",
    modules: 3,
    units: 15,
  },
  {
    number: 6,
    icon: <Link2 size={18} />,
    title: "Technology & Innovation",
    description: "Integrate EdTech tools and foster innovation across your institution.",
    modules: 3,
    units: 15,
  },
  {
    number: 7,
    icon: <GraduationCap size={18} />,
    title: "Private School Leadership",
    description: "Navigate the unique governance and growth challenges of private school leadership.",
    modules: 3,
    units: 15,
  },
];

export const recentActivity: ActivityItem[] = [
  { label: "Completed Unit 9 — Strategic Vision & School Culture", time: "2 hours ago", done: true },
  { label: "Passed Module 1 Assessment — Score: 88%", time: "Yesterday", done: true },
  { label: "Started Unit 10 — Community-Led School Improvement", time: "Today", done: false },
];