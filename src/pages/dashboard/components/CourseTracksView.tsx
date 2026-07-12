import { useState, useMemo, useEffect } from "react";
import { ChevronDown, Lock, BookOpen, Clock, Layers } from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import type { Course, CourseTrack } from "../../../services/types/course.types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../components/ui/DropdownMenu";

const SORT_OPTIONS = ["Progress", "Title (A-Z)", "Recently Added"];

// Local track images — name each file after the track's `slug` field
// (e.g. slug "foundational-track" → public/images/tracks/foundational-track.jpg).
// Drop files straight in that folder; nothing else needs to change here.
// If a slug has no matching file, the image just fails to load and the
// gradient underneath shows on its own — no broken-image icon.
const TRACK_IMAGE_BASE_PATH = "/images/tracks/";
const TRACK_IMAGE_EXT = ".jpg";

const MOBILE_BP = 768;
const DESKTOP_BP = 1200;

// 1 column mobile, 2 tablet, 3 desktop — hard cap at 3 columns.
function useGridColumns() {
  const getColumns = () => {
    const w = window.innerWidth;
    if (w < MOBILE_BP) return 1;
    if (w < DESKTOP_BP) return 2;
    return 3;
  };
  const [columns, setColumns] = useState(getColumns);
  useEffect(() => {
    const handler = () => setColumns(getColumns());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return columns;
}

const TRACK_COLORS = [
  { border: "#10b981", fill: "#10b981" },
  { border: "#3b82f6", fill: "#3b82f6" },
  { border: "#8b5cf6", fill: "#8b5cf6" },
  { border: "#f59e0b", fill: "#f59e0b" },
  { border: "#f43f5e", fill: "#f43f5e" },
  { border: "#06b6d4", fill: "#06b6d4" },
  { border: "#6366f1", fill: "#6366f1" },
];

// Card image-section gradients, matched 1-to-1 with TRACK_COLORS by index.
const TRACK_GRADIENTS = [
  "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
  "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  "linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #78350f 0%, #f59e0b 100%)",
  "linear-gradient(135deg, #881337 0%, #f43f5e 100%)",
  "linear-gradient(135deg, #164e63 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
];

interface CourseTracksViewProps {
  course: Course;
  onTrackClick?: (trackId: number) => void;
}

export default function CourseTracksView({ course, onTrackClick }: CourseTracksViewProps) {
  const columns = useGridColumns();
  const [sortBy, setSortBy] = useState("Progress");

  const tracks = useMemo(() => {
    const result = [...course.tracks];

    if (sortBy === "Title (A-Z)") {
      result.sort((a: CourseTrack, b: CourseTrack) => a.title.localeCompare(b.title));
    } else if (sortBy === "Recently Added") {
      result.sort((a: CourseTrack, b: CourseTrack) => b.id - a.id);
    }

    // Foundational Track always stays first, regardless of sort or filter order
    const foundationalIndex = result.findIndex((t) =>
      t.title.toLowerCase().includes("foundational")
    );
    if (foundationalIndex > 0) {
      const [foundational] = result.splice(foundationalIndex, 1);
      result.unshift(foundational);
    }

    return result;
  }, [course.tracks, sortBy]);

  const getTrackColor = (index: number) => TRACK_COLORS[index % TRACK_COLORS.length];
  const getTrackGradient = (index: number) => TRACK_GRADIENTS[index % TRACK_GRADIENTS.length];

  return (
    // Single scroll container — header, filter bar, and grid all scroll
    // together so the page always starts at the top and scrolls naturally
    // to the bottom, matching the pattern used in Overview.tsx.
    <div style={{
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      minHeight: 0,
      backgroundColor: "#fafafa",
      scrollBehavior: "smooth",
      WebkitOverflowScrolling: "touch",
      overscrollBehavior: "contain",
    }}>
      {/* Header — scrolls with the page, not fixed above scroll area */}
      <div style={{ padding: "32px 32px 16px 32px" }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#888888",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Course
        </span>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#101b37",
            fontFamily: "var(--font-headline)",
            letterSpacing: "-0.02em",
            marginTop: "4px",
          }}
        >
          {course.title}
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#888888",
            marginTop: "4px",
            maxWidth: "640px",
            lineHeight: 1.5,
          }}
        >
          {course.shortDescription || course.description}
        </p>
      </div>

      {/* Filter Bar — scrolls with the page too */}
      <div
        style={{
          padding: "16px 32px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outlined" size="sm">
                All Tracks <ChevronDown size={14} style={{ color: "#888888" }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent style={{ minWidth: "180px" }}>
              <DropdownMenuItem>All Tracks</DropdownMenuItem>
              {course.tracks.map((track: CourseTrack) => (
                <DropdownMenuItem key={track.id}>{track.title}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outlined" size="sm">
                Sort by {sortBy} <ChevronDown size={14} style={{ color: "#888888" }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent style={{ minWidth: "160px" }}>
              {SORT_OPTIONS.map((option: string) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setSortBy(option)}
                  style={{
                    color: sortBy === option ? "#006400" : "#444444",
                    backgroundColor: sortBy === option ? "rgba(0,100,0,0.06)" : "transparent",
                    fontWeight: sortBy === option ? 700 : 500,
                  }}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Track Cards Grid — no longer its own scroll region, just regular content */}
      <div style={{ padding: "32px" }}>
        <style>{`
          .slan-track-card {
            transition: box-shadow 0.25s ease, transform 0.25s ease;
          }
          .slan-track-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            transform: translateY(-2px);
          }
          .slan-track-photo {
            transition: opacity 0.3s ease;
          }
          .slan-track-gradient {
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .slan-track-card:hover .slan-track-photo {
            opacity: 0.3;
          }
          .slan-track-card:hover .slan-track-gradient {
            opacity: 0.92;
          }
        `}</style>
        {tracks.length === 0 ? (
          <div style={{ minHeight: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <BookOpen size={48} style={{ color: "#d1d1d1", marginBottom: "16px" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#888888" }}>
              No tracks match your filters
            </p>
            <p style={{ fontSize: "13px", color: "#b0b0b0", marginTop: "4px" }}>
              Try adjusting your filter criteria
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            {tracks.map((track: CourseTrack, index: number) => {
              const color = getTrackColor(index);
              const gradient = getTrackGradient(index);
              const progress = track.progressPercent ?? 0;
              const moduleCount = track.moduleCount ?? 0;
              const unitCount = track.unitCount ?? 0;
              const estimatedHours = Math.round((track.totalEstimatedMinutes ?? 0) / 60) || 12;

              return (
                <div
                  key={track.id}
                  onClick={() => onTrackClick?.(track.id)}
                  className="cursor-pointer slan-track-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e8e8e8",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Image section */}
                  <div
                    style={{
                      position: "relative",
                      height: "190px",
                      flexShrink: 0,
                      backgroundColor: "#f0f0f0",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={track.thumbnail || `${TRACK_IMAGE_BASE_PATH}${track.slug}${TRACK_IMAGE_EXT}`}
                      alt=""
                      className="slan-track-photo"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />

                    <div
                      className="slan-track-gradient"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BookOpen size={32} style={{ color: "rgba(255,255,255,0.85)" }} />
                    </div>

                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "28px",
                        width: "28px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        color: "#101b37",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </span>

                    {!track.isFree && (
                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "28px",
                          width: "28px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <Lock size={13} style={{ color: "#d4af37" }} />
                      </span>
                    )}
                  </div>

                  {/* Details section */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      padding: "20px",
                      borderTop: `3px solid ${color.border}`,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#101b37",
                        fontFamily: "var(--font-headline)",
                        letterSpacing: "-0.01em",
                        marginBottom: "8px",
                        lineHeight: 1.3,
                        minHeight: "47px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {track.title}
                    </h3>

                    <p
                      style={{
                        fontSize: "14px",
                        color: "#888888",
                        marginBottom: "16px",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "42px",
                      }}
                    >
                      {track.shortDescription || "Explore this track to build your skills."}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#b0b0b0", marginBottom: "20px", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Layers size={13} />
                        <span>{moduleCount} Modules</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <BookOpen size={13} />
                        <span>{unitCount} Units</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={13} />
                        <span>{estimatedHours}h</span>
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>
                          Progress
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#101b37" }}>
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} color={color.fill} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom padding so last card isn't flush against edge on mobile */}
        <div style={{ height: "32px" }} />
      </div>
    </div>
  );
}