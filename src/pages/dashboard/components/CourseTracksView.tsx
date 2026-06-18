import { useState, useMemo } from "react";
import { ChevronDown, Lock, BookOpen, Clock, Layers } from "lucide-react";
// Adjust these paths based on where YOUR files actually are:
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/progress";
import type { Course } from "../../../services/types/course.types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../components/ui/DropdownMenu";

const LEVEL_FILTERS = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const SORT_OPTIONS = ["Progress", "Title (A-Z)", "Recently Added"];

const TRACK_COLORS = [
  { border: "#10b981", fill: "#10b981" },
  { border: "#3b82f6", fill: "#3b82f6" },
  { border: "#8b5cf6", fill: "#8b5cf6" },
  { border: "#f59e0b", fill: "#f59e0b" },
  { border: "#f43f5e", fill: "#f43f5e" },
  { border: "#06b6d4", fill: "#06b6d4" },
  { border: "#6366f1", fill: "#6366f1" },
];

interface CourseTracksViewProps {
  course: Course;
  onTrackClick?: (trackId: number) => void;
}

export default function CourseTracksView({ course, onTrackClick }: CourseTracksViewProps) {
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("Progress");

  const tracks = useMemo(() => {
    let result = [...course.tracks];

    if (selectedLevel !== "All Levels") {
      const levels = ["Beginner", "Intermediate", "Advanced"];
      result = result.filter((_: CourseTrack, i: number) => levels[i % 3] === selectedLevel);
    }

    if (sortBy === "Title (A-Z)") {
      result.sort((a: CourseTrack, b: CourseTrack) => a.title.localeCompare(b.title));
    } else if (sortBy === "Recently Added") {
      result.sort((a: CourseTrack, b: CourseTrack) => b.id - a.id);
    }

    return result;
  }, [course.tracks, selectedLevel, sortBy]);

  const getTrackColor = (index: number) => TRACK_COLORS[index % TRACK_COLORS.length];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#fafafa" }}>
      {/* Header */}
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

      {/* Filter Bar */}
      <div
        style={{
          padding: "16px 32px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="flex items-center gap-3">
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
                {selectedLevel} <ChevronDown size={14} style={{ color: "#888888" }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent style={{ minWidth: "160px" }}>
              {LEVEL_FILTERS.map((level: string) => (
                <DropdownMenuItem
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  style={{
                    color: selectedLevel === level ? "#006400" : "#444444",
                    backgroundColor: selectedLevel === level ? "rgba(0,100,0,0.06)" : "transparent",
                    fontWeight: selectedLevel === level ? 700 : 500,
                  }}
                >
                  {level}
                </DropdownMenuItem>
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

      {/* Track Cards Grid */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "32px" }}>
        {tracks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ height: "100%", textAlign: "center" }}
          >
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
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              maxWidth: "1200px",
            }}
          >
            {tracks.map((track: CourseTrack, index: number) => {
              const color = getTrackColor(index);
              const progress = 0;

              return (
                <div
                  key={track.id}
                  onClick={() => onTrackClick?.(track.id)}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e8e8e8",
                    borderLeftWidth: "4px",
                    borderLeftColor: color.border,
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0,100,0,0.02)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="flex items-start justify-between" style={{ marginBottom: "12px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "32px",
                        width: "32px",
                        borderRadius: "50%",
                        backgroundColor: "#f5f5f5",
                        color: "#888888",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </span>
                    {!track.isFree && (
                      <Lock size={14} style={{ color: "#d4af37", marginTop: "4px" }} />
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#101b37",
                      fontFamily: "var(--font-headline)",
                      letterSpacing: "-0.01em",
                      marginBottom: "8px",
                      lineHeight: 1.3,
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
                    }}
                  >
                    {track.shortDescription || "Explore this track to build your skills."}
                  </p>

                  <div
                    className="flex items-center gap-4"
                    style={{ fontSize: "12px", color: "#b0b0b0", marginBottom: "20px" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers size={13} />
                      <span>3 Modules</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} />
                      <span>15 Units</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      <span>12h</span>
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="flex items-center justify-between">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Local type for track items
interface CourseTrack {
  id: number;
  title: string;
  slug: string;
  isFree: boolean;
  status: string;
  shortDescription?: string;
}