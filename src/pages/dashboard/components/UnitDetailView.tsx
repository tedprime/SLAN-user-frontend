import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronSep,
  Clock,
  BookOpen,
  CheckCircle,
  Check,
  Lock,
  X,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import { courseService } from "../../../services/courseService";
import { progressService } from "../../../services/progressService";
import type {
  ModuleSummary,
  UnitSummary,
  UnitContent,
} from "../../../services/types/course.types";

interface UnitViewerProps {
  courseId: number;
  trackId: number;
  module: ModuleSummary;
  allModules?: ModuleSummary[];
  courseName: string;
  trackName: string;
  onBack?: () => void;
  onBackToTrack?: () => void;
  onProgressChange?: () => void;
  onNextModule?: (module: ModuleSummary) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && typeof res === "object" && "data" in res) return res.data as T;
  return res as T;
}

const MOBILE_BP = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BP);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function UnitViewer({
  module,
  allModules,
  courseName,
  trackName,
  onBack,
  onBackToTrack,
  onProgressChange,
  onNextModule,
}: UnitViewerProps) {
  const isMobile = useIsMobile();

  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [activeUnit, setActiveUnit] = useState<UnitContent | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarOpen = isMobile ? mobileOpen : desktopOpen;
  const setSidebarOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    if (isMobile)
      setMobileOpen((p) => (typeof next === "function" ? next(p) : next));
    else setDesktopOpen((p) => (typeof next === "function" ? next(p) : next));
  };

  const [completedUnitIds, setCompletedUnitIds] = useState<Set<number>>(
    new Set(),
  );
  const [moduleProgressPercent, setModuleProgressPercent] = useState(0);
  const [marking, setMarking] = useState(false);

  // The unit-content scroll container. Since the same DOM node is reused
  // across unit switches (only `activeUnit` changes), the browser keeps
  // whatever scroll position the previous unit was left at — so without
  // this, clicking "Next" can drop you in the middle of the new unit.
  const contentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedUnitId]);

  const refreshModuleProgress = useCallback(async () => {
    try {
      const raw = await progressService.getModuleProgress(module.id);
      const progress = unwrap<{
        completedUnitIds?: number[];
        progressPercent?: number;
      }>(raw);
      setCompletedUnitIds(new Set(progress.completedUnitIds ?? []));
      setModuleProgressPercent(progress.progressPercent ?? 0);
    } catch {
      /* non-critical */
    }
  }, [module.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [res] = await Promise.all([
          courseService.getModuleUnits(module.id),
          refreshModuleProgress(),
        ]);
        const unitList = Array.isArray(res?.units) ? res.units : [];
        if (!cancelled) {
          setUnits(unitList);
          setSelectedUnitId((prev) =>
            prev === null && unitList.length > 0 ? unitList[0].id : prev,
          );
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [module.id, refreshModuleProgress]);

  useEffect(() => {
    if (!selectedUnitId) return;
    const unitSummary = units.find((u) => u.id === selectedUnitId);
    if (!unitSummary) return;
    let cancelled = false;
    (async () => {
      try {
        const unit = await courseService.getUnit(unitSummary.slug);
        if (!cancelled) setActiveUnit(unit);
      } catch {
        if (!cancelled) setActiveUnit(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedUnitId, units]);

  const currentIndex = units.findIndex((u) => u.id === selectedUnitId);
  const canGoPrevious = currentIndex > 0;
  const isLastUnitInModule = currentIndex === units.length - 1;
  const currentModuleIndex = allModules
    ? allModules.findIndex((m) => m.id === module.id)
    : -1;
  const nextModule =
    allModules &&
    currentModuleIndex >= 0 &&
    currentModuleIndex < allModules.length - 1
      ? allModules[currentModuleIndex + 1]
      : null;
  const isCurrentUnitCompleted =
    selectedUnitId !== null && completedUnitIds.has(selectedUnitId);
  const canGoNext =
    isCurrentUnitCompleted && (!isLastUnitInModule || !!nextModule);

  const goPrevious = () => {
    if (canGoPrevious) setSelectedUnitId(units[currentIndex - 1].id);
  };
  const goNext = () => {
    if (!isLastUnitInModule) {
      setSelectedUnitId(units[currentIndex + 1].id);
    } else if (nextModule) {
      onNextModule?.(nextModule);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedUnitId || marking || isCurrentUnitCompleted) return;
    setMarking(true);
    setCompletedUnitIds((prev) => new Set(prev).add(selectedUnitId));
    try {
      await progressService.markUnitComplete(selectedUnitId);
      try {
        const raw = await progressService.getModuleProgress(module.id);
        const progress = unwrap<{
          completedUnitIds?: number[];
          progressPercent?: number;
        }>(raw);
        const fromApi = new Set<number>(progress.completedUnitIds ?? []);
        if (fromApi.size > 0) {
          setCompletedUnitIds(fromApi);
          setModuleProgressPercent(progress.progressPercent ?? 0);
        } else {
          if ((progress.progressPercent ?? 0) > 0) {
            setModuleProgressPercent(progress.progressPercent ?? 0);
          }
        }
      } catch {
        /* keep optimistic state */
      }
      onProgressChange?.();
    } catch {
      setCompletedUnitIds((prev) => {
        const next = new Set(prev);
        next.delete(selectedUnitId);
        return next;
      });
    } finally {
      setMarking(false);
    }
  };

  const handleUnitSelect = (unitId: number) => {
    setSelectedUnitId(unitId);
    if (isMobile) setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e8e8e8",
              borderTopColor: "#006400",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: "14px", color: "#888888" }}>Loading units...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
        }}
      >
        <div className="text-center">
          <p
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#d32f2f",
              marginBottom: "8px",
            }}
          >
            Failed to load units
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ─── Sidebar panel (shared between drawer and inline) ───────────────────────
  const sidebarPanel = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: isMobile ? "min(300px, 85vw)" : "300px",
        height: "100%",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Sidebar header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#101b37",
            fontFamily: "var(--font-headline)",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          Units
        </h3>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close unit list"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              color: "#888888",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Unit list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
          minHeight: 0,
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {units.map((unit, index) => {
          const isActive = unit.id === selectedUnitId;
          const isCompleted = completedUnitIds.has(unit.id);
          const isLocked =
            index > 0 && !completedUnitIds.has(units[index - 1].id);

          return (
            <button
              key={unit.id}
              onClick={() => {
                if (!isLocked) handleUnitSelect(unit.id);
              }}
              title={isLocked ? "Complete the previous unit first" : unit.title}
              disabled={isLocked}
              className="w-full text-left"
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                marginBottom: "4px",
                backgroundColor: isActive
                  ? "rgba(0,100,0,0.06)"
                  : "transparent",
                border: "none",
                cursor: isLocked ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                opacity: isLocked ? 0.55 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isLocked)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "rgba(0,100,0,0.03)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "24px",
                  width: "24px",
                  minWidth: "24px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: isCompleted
                    ? "#10b981"
                    : isActive
                      ? "#006400"
                      : isLocked
                        ? "#e8e8e8"
                        : "#f5f5f5",
                  color: isCompleted || isActive ? "#ffffff" : "#888888",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {isCompleted ? (
                  <CheckCircle size={12} />
                ) : isLocked ? (
                  <Lock size={10} />
                ) : (
                  index + 1
                )}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: isActive ? 700 : 600,
                    color: isActive
                      ? "#006400"
                      : isLocked
                        ? "#aaaaaa"
                        : "#101b37",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {unit.title || `Unit ${index + 1}`}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#b0b0b0",
                    marginTop: "2px",
                  }}
                >
                  {unit.estimatedReadMinutes} min
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Module progress */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #e0e0e0",
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: "8px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>
            Module progress
          </span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#101b37" }}>
            {moduleProgressPercent}%
          </span>
        </div>
        <Progress value={moduleProgressPercent} color="#006400" />
      </div>
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        backgroundColor: "#fafafa",
      }}
    >
      {/* Breadcrumb bar */}
      <div
        style={{
          padding: isMobile ? "12px 16px" : "14px 24px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#888888",
              fontSize: "13px",
              padding: 0,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#006400";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#888888";
            }}
          >
            {courseName}
          </button>
          <ChevronSep size={14} style={{ color: "#d1d1d1", flexShrink: 0 }} />
          <button
            onClick={onBackToTrack ?? onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#888888",
              fontSize: "13px",
              padding: 0,
              flexShrink: isMobile ? 1 : 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#006400";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#888888";
            }}
          >
            {trackName}
          </button>
          <ChevronSep size={14} style={{ color: "#d1d1d1", flexShrink: 0 }} />
          <span
            style={{
              fontWeight: 600,
              color: "#101b37",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {module.title}
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── MOBILE: sidebar as a slide-over drawer ── */}
        {isMobile && (
          <>
            {sidebarOpen && (
              <div
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  zIndex: 30,
                  touchAction: "none",
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 40,
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.25s ease",
                borderRight: "1px solid #e0e0e0",
                boxShadow: sidebarOpen ? "4px 0 20px rgba(0,0,0,0.10)" : "none",
                overflow: "hidden",
              }}
            >
              {sidebarPanel}
            </div>
          </>
        )}

        {/* ── DESKTOP: sidebar inline ── */}
        {!isMobile && sidebarOpen && (
          <div
            style={{
              borderRight: "1px solid #e0e0e0",
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              width: sidebarOpen ? "300px" : "0px",
              transition: "width 0.25s ease",
            }}
          >
            {sidebarPanel}
          </div>
        )}

        {/* Right Content Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {activeUnit ? (
            // Single scroll container — unit header, content, and bottom nav
            // all scroll together instead of the header/nav being pinned,
            // matching the pattern used in Overview.tsx.
            <div
              ref={contentScrollRef}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                overflowX: "hidden",
                minHeight: 0,
                backgroundColor: "#fafafa",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              {/* Unit header — scrolls with the page, not pinned above scroll area */}
              <div
                style={{
                  padding: isMobile ? "16px" : "24px 32px",
                  borderBottom: "1px solid #e0e0e0",
                  backgroundColor: "#ffffff",
                }}
              >
                <div style={{ maxWidth: "800px" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#888888",
                      marginBottom: "8px",
                    }}
                  >
                    Unit {currentIndex + 1} of {units.length}
                  </p>
                  <h1
                    style={{
                      fontSize: isMobile ? "20px" : "24px",
                      fontWeight: 800,
                      color: "#101b37",
                      fontFamily: "var(--font-headline)",
                      marginBottom: "8px",
                      lineHeight: 1.2,
                    }}
                  >
                    {activeUnit.title}
                  </h1>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#888888",
                      lineHeight: 1.5,
                    }}
                  >
                    {activeUnit.description}
                  </p>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Clock size={14} style={{ color: "#b0b0b0" }} />
                    <span style={{ fontSize: "13px", color: "#888888" }}>
                      {activeUnit.estimatedReadMinutes} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Unit content — no longer its own scroll region, just regular content */}
              <div
                style={{
                  padding: isMobile ? "20px 16px" : "32px",
                }}
              >
                <div style={{ maxWidth: "800px" }}>
                  {activeUnit.content ? (
                    <div
                      style={{
                        fontSize: "15px",
                        lineHeight: 1.7,
                        color: "#444444",
                      }}
                      dangerouslySetInnerHTML={{ __html: activeUnit.content }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: "15px",
                        color: "#444444",
                        lineHeight: 1.7,
                      }}
                    >
                      {activeUnit.description}
                    </p>
                  )}

                  {(activeUnit.videoUrl || activeUnit.pdfUrl) && (
                    <div
                      style={{
                        marginTop: "32px",
                        padding: "20px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "12px",
                        border: "1px solid #e8e8e8",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#101b37",
                          marginBottom: "12px",
                          fontFamily: "var(--font-headline)",
                        }}
                      >
                        Resources
                      </h4>
                      <div className="space-y-2">
                        {activeUnit.videoUrl && (
                          
                            <a href={activeUnit.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "13px",
                              color: "#006400",
                              textDecoration: "none",
                            }}
                          >
                            <BookOpen size={14} />
                            Watch video
                          </a>
                        )}
                        {activeUnit.pdfUrl && (
                          
                           <a href={activeUnit.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "13px",
                              color: "#006400",
                              textDecoration: "none",
                            }}
                          >
                            <BookOpen size={14} />
                            Download PDF
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom nav — scrolls with the page too, no longer pinned */}
              <div
                style={{
                  padding: isMobile ? "12px 16px" : "16px 32px",
                  borderTop: "1px solid #e0e0e0",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    maxWidth: "800px",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={goPrevious}
                    disabled={!canGoPrevious}
                  >
                    <ChevronLeft size={14} />
                    {!isMobile && "Previous"}
                  </Button>

                  <Button
                    variant={isCurrentUnitCompleted ? "outlined" : "primary"}
                    size="sm"
                    onClick={handleMarkComplete}
                    disabled={isCurrentUnitCompleted || marking}
                  >
                    {isCurrentUnitCompleted ? (
                      <>
                        <CheckCircle size={14} />
                        {!isMobile && "Completed"}
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        {marking
                          ? "Saving…"
                          : isMobile
                            ? "Complete"
                            : "Mark complete"}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={goNext}
                    disabled={!canGoNext}
                  >
                    {isLastUnitInModule && nextModule
                      ? isMobile
                        ? "Next mod."
                        : "Next Module"
                      : isMobile
                        ? "Next"
                        : "Next"}
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>

              {/* Bottom padding so nav isn't flush against the edge */}
              <div style={{ height: "16px" }} />
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ fontSize: "15px", color: "#888888" }}>
                Select a unit to begin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}