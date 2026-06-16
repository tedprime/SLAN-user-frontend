import { useState, useMemo } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import OverviewView from "./components/OverviewView";
import CoursesView from "./components/CoursesView";
import TrackDetailView from "./components/TrackDetailView";
import { ALL_TRACKS } from "./data";
import type { Track } from "./index";

/**
 * Seed enrolled track numbers here (e.g. from a real API response).
 * Tracks 1 & 2 are pre-enrolled for demo purposes.
 */
const INITIAL_ENROLLED = new Set<number>([1, 2]);

function buildTracks(enrolledNumbers: Set<number>): Track[] {
  return ALL_TRACKS.map((t) => {
    const enrolled = enrolledNumbers.has(t.number);

    // Demo progress logic — swap for real API data
    if (t.number === 1)
      return { ...t, status: "completed", progress: 100 };
    if (t.number === 2)
      return { ...t, status: "in-progress", progress: 60 };
    if (enrolled)
      return { ...t, status: "locked", progress: 0 };

    return { ...t, status: "locked", progress: 0 };
  });
}

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchVal, setSearchVal] = useState("");
  const [enrolledNumbers, setEnrolledNumbers] = useState<Set<number>>(INITIAL_ENROLLED);

  const tracks = useMemo(() => buildTracks(enrolledNumbers), [enrolledNumbers]);

  const enrolledTracks = tracks.filter((t) => enrolledNumbers.has(t.number));

  /** Enroll in a single track by number */
  const handleEnroll = (trackNumber: number) => {
    setEnrolledNumbers((prev) => new Set([...prev, trackNumber]));
  };

  /** Enroll in the full programme (called from CourseDetailOverlay) */
  // const handleEnrollAll = () => {
  //   setEnrolledNumbers(new Set(ALL_TRACKS.map((t) => t.number)));
  // };

  // Resolve which view to render
  const renderView = () => {
    if (activeNav === "overview") {
      return <OverviewView enrolledTracks={enrolledTracks} />;
    }

    if (activeNav === "courses") {
      return (
        <CoursesView
          tracks={tracks}
          enrolledNumbers={enrolledNumbers}
          onEnroll={handleEnroll}
        />
      );
    }

    if (activeNav.startsWith("track-")) {
      const num = parseInt(activeNav.replace("track-", ""), 10);
      const track = tracks.find((t) => t.number === num);
      if (track) return <TrackDetailView track={track} />;
    }

    return null;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50">
      {/* ── Sidebar ── */}
    <DashboardSidebar
  activeNav={activeNav}
  onNavChange={setActiveNav}
/>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          activeNav={activeNav}
          searchVal={searchVal}
          onSearchChange={setSearchVal}
        />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}