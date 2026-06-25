import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, ChevronRight as ChevronSep, Clock, BookOpen, CheckCircle, Check, Lock } from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import { courseService } from "../../../services/courseService";
import { progressService } from "../../../services/progressService";
import type { ModuleSummary, UnitSummary, UnitContent } from "../../../services/types/course.types";

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

export default function UnitViewer({ module, allModules, courseName, trackName, onBack, onBackToTrack, onProgressChange, onNextModule }: UnitViewerProps) {
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [activeUnit, setActiveUnit] = useState<UnitContent | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [completedUnitIds, setCompletedUnitIds] = useState<Set<number>>(new Set());
  const [moduleProgressPercent, setModuleProgressPercent] = useState(0);
  const [marking, setMarking] = useState(false);

  const refreshModuleProgress = useCallback(async () => {
    try {
      const raw = await progressService.getModuleProgress(module.id);
      const progress = unwrap<{ completedUnitIds?: number[]; progressPercent?: number }>(raw);
      setCompletedUnitIds(new Set(progress.completedUnitIds ?? []));
      setModuleProgressPercent(progress.progressPercent ?? 0);
    } catch { /* non-critical */ }
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
          setSelectedUnitId((prev) => (prev === null && unitList.length > 0 ? unitList[0].id : prev));
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
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
    return () => { cancelled = true; };
  }, [selectedUnitId, units]);

  const currentIndex = units.findIndex((u) => u.id === selectedUnitId);
  const canGoPrevious = currentIndex > 0;
  const isLastUnitInModule = currentIndex === units.length - 1;
  const currentModuleIndex = allModules ? allModules.findIndex((m) => m.id === module.id) : -1;
  const nextModule = allModules && currentModuleIndex >= 0 && currentModuleIndex < allModules.length - 1
    ? allModules[currentModuleIndex + 1]
    : null;
  const isCurrentUnitCompleted = selectedUnitId !== null && completedUnitIds.has(selectedUnitId);
  const canGoNext = isCurrentUnitCompleted && (!isLastUnitInModule || !!nextModule);

  const goPrevious = () => { if (canGoPrevious) setSelectedUnitId(units[currentIndex - 1].id); };
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
        const progress = unwrap<{ completedUnitIds?: number[]; progressPercent?: number }>(raw);
        const fromApi = new Set<number>(progress.completedUnitIds ?? []);
      
        if (fromApi.size > 0) {
          setCompletedUnitIds(fromApi);
          setModuleProgressPercent(progress.progressPercent ?? 0);
        } else {
          // API didn't return ids — just update the percent if available
          if ((progress.progressPercent ?? 0) > 0) {
            setModuleProgressPercent(progress.progressPercent ?? 0);
          }
        }
      } catch { /* keep optimistic state */ }
      onProgressChange?.();
    } catch {
      // Roll back optimistic update only on actual POST failure
      setCompletedUnitIds((prev) => {
        const next = new Set(prev);
        next.delete(selectedUnitId);
        return next;
      });
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div className="flex flex-col items-center gap-3">
          <div style={{ width: "40px", height: "40px", border: "3px solid #e8e8e8", borderTopColor: "#006400", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "14px", color: "#888888" }}>Loading units...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div className="text-center">
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>Failed to load units</p>
          <Button variant="primary" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, backgroundColor: "#fafafa" }}>
      {/* Breadcrumb: course > track > module */}
      <div style={{
        padding: "14px 24px", borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#ffffff", display: "flex", alignItems: "center",
        gap: "6px", fontSize: "13px", flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#888888", fontSize: "13px", padding: 0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
        >
          {courseName}
        </button>
        <ChevronSep size={14} style={{ color: "#d1d1d1", flexShrink: 0 }} />
        <button
          onClick={onBackToTrack ?? onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#888888", fontSize: "13px", padding: 0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
        >
          {trackName}
        </button>
        <ChevronSep size={14} style={{ color: "#d1d1d1", flexShrink: 0 }} />
        <span style={{ fontWeight: 600, color: "#101b37" }}>
          {module.title}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* Left Sidebar */}
        <div style={{
          width: "300px", borderRight: "1px solid #e0e0e0",
          backgroundColor: "#ffffff", display: "flex",
          flexDirection: "column", flexShrink: 0, minHeight: 0,
        }}>
          {/* Sidebar Header */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #e0e0e0", flexShrink: 0 }}>  
            <h3 style={{
              fontSize: "15px", fontWeight: 700, color: "#101b37",
              fontFamily: "var(--font-headline)", lineHeight: 1.3,
            }}>
              Units
            </h3>
          </div>

          {/* Unit List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {units.map((unit, index) => {
              const isActive = unit.id === selectedUnitId;
              const isCompleted = completedUnitIds.has(unit.id);
              // A unit is locked if the previous unit is not completed (and this isn't the first unit)
              const isLocked = index > 0 && !completedUnitIds.has(units[index - 1].id);

              return (
                <button
                  key={unit.id}
                  onClick={() => { if (!isLocked) setSelectedUnitId(unit.id); }}
                  title={isLocked ? "Complete the previous unit first" : unit.title}
                  disabled={isLocked}
                  className="w-full text-left"
                  style={{
                    padding: "10px 16px", borderRadius: "8px", marginBottom: "4px",
                    backgroundColor: isActive ? "rgba(0,100,0,0.06)" : "transparent",
                    border: "none",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: "10px",
                    opacity: isLocked ? 0.55 : 1,
                  }}
                  onMouseEnter={(e) => { if (!isActive && !isLocked) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,100,0,0.03)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                >
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    height: "24px", width: "24px", borderRadius: "50%", flexShrink: 0,
                    backgroundColor: isCompleted ? "#10b981" : isActive ? "#006400" : isLocked ? "#e8e8e8" : "#f5f5f5",
                    color: isCompleted || isActive ? "#ffffff" : "#888888",
                    fontSize: "11px", fontWeight: 700,
                  }}>
                    {isCompleted ? <CheckCircle size={12} /> : isLocked ? <Lock size={10} /> : index + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "13px", fontWeight: isActive ? 700 : 600,
                      color: isActive ? "#006400" : isLocked ? "#aaaaaa" : "#101b37",
                      lineHeight: 1.3,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {unit.title || `Unit ${index + 1}`}
                    </p>
                    <p style={{ fontSize: "11px", color: "#b0b0b0", marginTop: "2px" }}>
                      {unit.estimatedReadMinutes} min
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Module Progress */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e0e0e0", flexShrink: 0 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>Module progress</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#101b37" }}>{moduleProgressPercent}%</span>
            </div>
            <Progress value={moduleProgressPercent} color="#006400" />
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
          {activeUnit ? (
            <>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#ffffff", flexShrink: 0 }}>
                <div style={{ maxWidth: "800px" }}>
                  <p style={{ fontSize: "13px", color: "#888888", marginBottom: "8px" }}>
                    Unit {currentIndex + 1} of {units.length}
                  </p>
                  <h1 style={{
                    fontSize: "24px", fontWeight: 800, color: "#101b37",
                    fontFamily: "var(--font-headline)", marginBottom: "8px", lineHeight: 1.2,
                  }}>
                    {activeUnit.title}
                  </h1>
                  <p style={{ fontSize: "15px", color: "#888888", lineHeight: 1.5 }}>
                    {activeUnit.description}
                  </p>
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={14} style={{ color: "#b0b0b0" }} />
                    <span style={{ fontSize: "13px", color: "#888888" }}>
                      {activeUnit.estimatedReadMinutes} minutes
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "32px", minHeight: 0 }}>
                <div style={{ maxWidth: "800px" }}>
                  {activeUnit.content ? (
                    <div
                      style={{ fontSize: "15px", lineHeight: 1.7, color: "#444444" }}
                      dangerouslySetInnerHTML={{ __html: activeUnit.content }}
                    />
                  ) : (
                    <p style={{ fontSize: "15px", color: "#444444", lineHeight: 1.7 }}>
                      {activeUnit.description}
                    </p>
                  )}

                  {(activeUnit.videoUrl || activeUnit.pdfUrl) && (
                    <div style={{
                      marginTop: "32px", padding: "20px",
                      backgroundColor: "#f5f5f5", borderRadius: "12px", border: "1px solid #e8e8e8",
                    }}>
                      <h4 style={{
                        fontSize: "14px", fontWeight: 700, color: "#101b37",
                        marginBottom: "12px", fontFamily: "var(--font-headline)",
                      }}>
                        Resources
                      </h4>
                      <div className="space-y-2">
                        {activeUnit.videoUrl && (
                          <a href={activeUnit.videoUrl} target="_blank" rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#006400", textDecoration: "none" }}
                          >
                            <BookOpen size={14} />
                            Watch video
                          </a>
                        )}
                        {activeUnit.pdfUrl && (
                          <a href={activeUnit.pdfUrl} target="_blank" rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#006400", textDecoration: "none" }}
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

              <div style={{ padding: "16px 32px", borderTop: "1px solid #e0e0e0", backgroundColor: "#ffffff", flexShrink: 0 }}>
                <div className="flex items-center justify-between" style={{ maxWidth: "800px" }}>
                  <Button variant="outlined" size="sm" onClick={goPrevious} disabled={!canGoPrevious}>
                    <ChevronLeft size={14} />
                    Previous
                  </Button>

                  <Button
                    variant={isCurrentUnitCompleted ? "outlined" : "primary"}
                    size="sm"
                    onClick={handleMarkComplete}
                    disabled={isCurrentUnitCompleted || marking}
                  >
                    {isCurrentUnitCompleted ? (
                      <><CheckCircle size={14} />Completed</>
                    ) : (
                      <><Check size={14} />{marking ? "Saving..." : "Mark complete"}</>
                    )}
                  </Button>

                  <Button variant="primary" size="sm" onClick={goNext} disabled={!canGoNext}>
                    {isLastUnitInModule && nextModule ? "Next Module" : "Next"}
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "15px", color: "#888888" }}>Select a unit to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}