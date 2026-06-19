import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, BookOpen, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Progress from "../../../components/ui/Progress";
import { courseService } from "../../../services/courseService";
import type { ModuleSummary, UnitSummary, UnitContent } from "../../../services/types/course.types";

interface UnitViewerProps {
  courseId: number;
  trackId: number;
  module: ModuleSummary;
  onBack?: () => void;
}

export default function UnitViewer({module, onBack }: UnitViewerProps) {
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [activeUnit, setActiveUnit] = useState<UnitContent | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch units for this module
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await courseService.getModuleUnits(module.id);
        const unitList = Array.isArray(res?.units) ? res.units : [];
        if (!cancelled) {
          setUnits(unitList);
          // Auto-select first unit
          if (unitList.length > 0 && !selectedUnitId) {
            setSelectedUnitId(unitList[0].id);
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [module.id]);

  // Fetch active unit content
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
  const canGoNext = currentIndex < units.length - 1;

  const goPrevious = () => {
    if (canGoPrevious) setSelectedUnitId(units[currentIndex - 1].id);
  };

  const goNext = () => {
    if (canGoNext) setSelectedUnitId(units[currentIndex + 1].id);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#fafafa" }}>
        <div className="flex flex-col items-center gap-3">
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e8e8e8",
            borderTopColor: "#006400",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ fontSize: "14px", color: "#888888" }}>Loading units...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#fafafa" }}>
        <div className="text-center">
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>
            Failed to load units
          </p>
          <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#fafafa" }}>
      <div className="flex h-full">
        {/* Left Sidebar - Unit List */}
        <div
          style={{
            width: "320px",
            borderRight: "1px solid #e0e0e0",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Module Header */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #e0e0e0" }}>
            <button
              onClick={onBack}
              style={{
                fontSize: "13px",
                color: "#888888",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ChevronLeft size={14} />
              Back to modules
            </button>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#101b37",
                fontFamily: "var(--font-headline)",
                lineHeight: 1.3,
              }}
            >
              {module.title}
            </h3>
            <p style={{ fontSize: "12px", color: "#888888", marginTop: "4px" }}>
              {units.length} {units.length === 1 ? "unit" : "units"}
            </p>
          </div>

          {/* Unit List */}
          <div className="flex-1 overflow-y-auto" style={{ padding: "8px" }}>
            {units.map((unit, index) => {
              const isActive = unit.id === selectedUnitId;
              const isCompleted = false; // TODO: wire from progress API

              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className="w-full text-left"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    backgroundColor: isActive ? "rgba(0,100,0,0.06)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "24px",
                        width: "24px",
                        borderRadius: "50%",
                        backgroundColor: isCompleted ? "#10b981" : isActive ? "#006400" : "#f5f5f5",
                        color: isCompleted || isActive ? "#ffffff" : "#888888",
                        fontSize: "11px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {isCompleted ? <CheckCircle size={12} /> : index + 1}
                    </span>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? "#006400" : "#101b37",
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {unit.title}
                      </p>
                      <p style={{ fontSize: "11px", color: "#b0b0b0", marginTop: "2px" }}>
                        {unit.estimatedReadMinutes} min
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Module Progress */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e0e0e0" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#888888" }}>
                Module Progress
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#101b37" }}>
                0%
              </span>
            </div>
            <Progress value={0} color="#006400" />
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeUnit ? (
            <>
              {/* Unit Header */}
              <div style={{ padding: "24px 32px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <div style={{ maxWidth: "800px" }}>
                  <p style={{ fontSize: "13px", color: "#888888", marginBottom: "8px" }}>
                    Unit {currentIndex + 1} of {units.length}
                  </p>
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "#101b37",
                      fontFamily: "var(--font-headline)",
                      marginBottom: "8px",
                      lineHeight: 1.2,
                    }}
                  >
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

              {/* Unit Content */}
              <div className="flex-1 overflow-y-auto" style={{ padding: "32px" }}>
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
                    <p style={{ fontSize: "15px", color: "#444444", lineHeight: 1.7 }}>
                      {activeUnit.description}
                    </p>
                  )}

                  {/* Resources */}
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
                          <a
                            href={activeUnit.videoUrl}
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
                            Watch Video
                          </a>
                        )}
                        {activeUnit.pdfUrl && (
                          <a
                            href={activeUnit.pdfUrl}
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

              {/* Unit Navigation Footer */}
              <div style={{ padding: "16px 32px", borderTop: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}>
                <div className="flex items-center justify-between" style={{ maxWidth: "800px" }}>
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={goPrevious}
                    disabled={!canGoPrevious}
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </Button>

                  <span style={{ fontSize: "13px", color: "#888888" }}>
                    {currentIndex + 1} / {units.length}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={goNext}
                    disabled={!canGoNext}
                  >
                    Next
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p style={{ fontSize: "15px", color: "#888888" }}>Select a unit to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}