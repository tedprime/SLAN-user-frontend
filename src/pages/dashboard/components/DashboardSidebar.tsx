import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Lock,
  Layers,
  FileText,
  CheckCircle,
} from "lucide-react";
import { authService } from "../../../services/authService";
import { courseService } from "../../../services/courseService";
import { progressService } from "../../../services/progressService";
import { getRefreshToken, clearTokens, getAccessToken } from "../../../services/tokenService";
import type { Course, ModuleSummary, UnitSummary } from "../../../services/types/course.types";

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCoursesLoaded?: (courses: Course[]) => void;
  onModuleNavigate?: (module: ModuleSummary, courseId: number, trackId: number, unitId?: number) => void;
  progressVersion?: number;
}

interface TrackModules { [trackId: number]: ModuleSummary[]; }
interface ModuleUnits { [moduleId: number]: UnitSummary[]; }

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

// Unwrap API envelope { success, data } defensively
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && typeof res === "object" && "data" in res) return res.data as T;
  return res as T;
}

function Collapsible({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
      <div style={{ overflow: "hidden", minHeight: 0 }}>{children}</div>
    </div>
  );
}

export default function DashboardSidebar({
  activeNav,
  onNavChange,
  isOpen,
  onToggle,
  onCoursesLoaded,
  onModuleNavigate,
  progressVersion,
}: DashboardSidebarProps) {
  const isMobile = useIsMobile();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(false);

  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set());
  const [expandedTrackIds, setExpandedTrackIds] = useState<Set<number>>(new Set());
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<number>>(new Set());

  const [trackModules, setTrackModules] = useState<TrackModules>({});
  const [moduleUnits, setModuleUnits] = useState<ModuleUnits>({});
  const [loadingTracks, setLoadingTracks] = useState<Set<number>>(new Set());
  const [loadingModules, setLoadingModules] = useState<Set<number>>(new Set());

  const [completedUnitIdsByTrack, setCompletedUnitIdsByTrack] = useState<Record<number, Set<number>>>({});

  const handleNavChange = (id: string) => {
    onNavChange(id);
    if (isMobile && isOpen) onToggle();
  };
  const handleModuleNavigate = (mod: ModuleSummary, courseId: number, trackId: number, unitId?: number) => {
    onModuleNavigate?.(mod, courseId, trackId, unitId);
    if (isMobile && isOpen) onToggle();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCoursesLoading(true);
      setCoursesError(false);
      try {
        const data = await courseService.getCourses();
        if (!cancelled) { setCourses(data); onCoursesLoaded?.(data); }
      } catch {
        if (!cancelled) setCoursesError(true);
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [onCoursesLoaded]);

  useEffect(() => {
    if (courses.length === 0) return;
    let cancelled = false;
    const allTracks = courses.flatMap((c) => c.tracks);
    (async () => {
      await Promise.all(
        allTracks.map(async (track) => {
          if (cancelled) return;
          setLoadingTracks((prev) => new Set(prev).add(track.id));
          try {
            const res = await courseService.getTrackModules(track.id);
            const modules = Array.isArray(res?.modules) ? res.modules : [];
            if (cancelled) return;
            setTrackModules((prev) => ({ ...prev, [track.id]: modules }));
            await Promise.all(
              modules.map(async (mod) => {
                setLoadingModules((prev) => new Set(prev).add(mod.id));
                try {
                  const unitsRes = await courseService.getModuleUnits(mod.id);
                  const units = Array.isArray(unitsRes?.units) ? unitsRes.units : [];
                  if (!cancelled) setModuleUnits((prev) => ({ ...prev, [mod.id]: units }));
                } catch {
                  if (!cancelled) setModuleUnits((prev) => ({ ...prev, [mod.id]: [] }));
                } finally {
                  setLoadingModules((prev) => { const s = new Set(prev); s.delete(mod.id); return s; });
                }
              })
            );
          } catch {
            if (!cancelled) setTrackModules((prev) => ({ ...prev, [track.id]: [] }));
          } finally {
            setLoadingTracks((prev) => { const s = new Set(prev); s.delete(track.id); return s; });
          }
        })
      );
    })();
    return () => { cancelled = true; };
  }, [courses]);

  const refreshCompletionForTrack = useCallback(async (trackId: number) => {
    // Don't attempt progress fetch if there's no auth token — avoid 401 flood
    if (!getAccessToken() && !getRefreshToken()) return;
    try {
      const raw = await progressService.getTrackCompletedUnits(trackId);
      // Unwrap envelope and handle both array and wrapped forms
< truncated lines 159-460 >
                                      {/* Module row */}
                                      <div
                                        className="w-full flex items-center justify-between"
                                        style={{
                                          margin: "1px 8px", width: "calc(100% - 16px)",
                                          borderRadius: "7px",
                                          backgroundColor: isModuleActive ? "rgba(0,100,0,0.06)" : "transparent",
                                          opacity: locked ? 0.55 : 1,
                                        }}
                                      >
                                        <button
                                          onClick={() => { if (!locked) handleModuleNavigate(mod, course.id, track.id); }}
                                          disabled={locked}
                                          title={locked ? "Complete the previous module to unlock" : mod.title}
                                          className="flex items-center text-left flex-1"
                                          style={{
                                            padding: "6px 0 6px 56px", fontSize: "12px", fontWeight: isModuleActive ? 600 : 400,
                                            transition: "color 0.15s", overflow: "hidden", minWidth: 0,
                                            backgroundColor: "transparent",
                                            color: locked ? "#bbbbbb" : isModuleActive ? "#006400" : "#888888",
                                            border: "none", cursor: locked ? "not-allowed" : "pointer", gap: "7px",
                                            borderRadius: "7px 0 0 7px",
                                          }}
                                          onMouseEnter={(e) => { if (!locked) (e.currentTarget as HTMLButtonElement).style.color = "#006400"; }}
                                          onMouseLeave={(e) => { if (!locked && !isModuleActive) (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
                                        >
                                          {locked
                                            ? <Lock size={11} style={{ flexShrink: 0, color: "#cccccc" }} />
                                            : <BookOpen size={11} style={{ flexShrink: 0, color: isModuleActive ? "#006400" : "#dddddd" }} />}
                                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.title}</span>
                                          {moduleComplete && !locked && <CheckCircle size={10} style={{ color: "#10b981", flexShrink: 0 }} />}
                                        </button>
                                        {!locked && (
                                          <button
                                            onClick={() => toggleModule(mod.id)}
                                            title={isModExpanded ? "Collapse units" : "Expand units"}
                                            style={{
                                              background: "transparent", border: "none", cursor: "pointer",
                                              padding: "6px 8px", display: "flex", alignItems: "center", flexShrink: 0,
                                              borderRadius: "0 7px 7px 0",
                                            }}
                                          >
                                            {isLoadingUnits
                                              ? <div style={{ width: "9px", height: "9px", border: "2px solid #e0e0e0", borderTopColor: "#006400", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                              : isModExpanded ? <ChevronDown size={11} style={{ color: "#cccccc" }} /> : <ChevronRight size={11} style={{ color: "#cccccc" }} />}
                                          </button>
                                        )}
                                      </div>

                                      <Collapsible open={isModExpanded && !isLoadingUnits}>
                                        <div>
                                          {units.length === 0 && (
                                            <div style={{ padding: "4px 12px 4px 72px", fontSize: "11px", color: "#cccccc" }}>No units yet.</div>
                                          )}
                                          {units.map((unit, unitIndex) => {
                                            const isUnitActive = activeNav === `unit:${course.id}:${track.id}:${mod.id}:${unit.id}`;
                                            const isUnitComplete = completedUnitIds.has(unit.id);
                                            return (
                                              <button
                                                key={unit.id}
                                                title={unit.title}
                                                onClick={() => handleModuleNavigate(mod, course.id, track.id, unit.id)}
                                                className="w-full text-left"
                                                style={{
                                                  padding: "5px 12px 5px 72px",
                                                  margin: "1px 8px", width: "calc(100% - 16px)",
                                                  borderRadius: "6px",
                                                  fontSize: "11px", fontWeight: 400,
                                                  transition: "all 0.15s",
                                                  backgroundColor: isUnitActive ? "rgba(0,100,0,0.05)" : "transparent",
                                                  color: isUnitActive ? "#006400" : "#aaaaaa",
                                                  border: "none", cursor: "pointer",
                                                  display: "flex", alignItems: "center", gap: "6px",
                                                }}
                                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; (e.currentTarget as HTMLButtonElement).style.color = "#555555"; }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isUnitActive ? "rgba(0,100,0,0.05)" : "transparent"; (e.currentTarget as HTMLButtonElement).style.color = isUnitActive ? "#006400" : "#aaaaaa"; }}
                                              >
                                                {/* Fixed-width icon slot */}
                                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "14px", flexShrink: 0 }}>
                                                  {isUnitComplete
                                                    ? <CheckCircle size={10} style={{ color: "#10b981" }} />
                                                    : <FileText size={10} style={{ color: "#e0e0e0" }} />}
                                                </span>
                                                <span style={{ whiteSpace: "nowrap" }}>Unit {unitIndex + 1}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </Collapsible>
                                    </div>
                                  );
                                })}
                              </div>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: "8px 8px 12px", flexShrink: 0, borderTop: "1px solid #f0f0f0" }}>
        <button
          title={!isOpen ? "Logout" : undefined}
          style={{
            display: "flex", alignItems: "center", width: "100%",
            padding: isOpen ? "8px 12px" : "8px 0",
            borderRadius: "8px", transition: "all 0.15s", fontSize: "13px", fontWeight: 500,
            color: "#888888", gap: "10px", justifyContent: isOpen ? "flex-start" : "center",
            border: "none", backgroundColor: "transparent", cursor: "pointer",
          }}
          onClick={async () => {
            try {
              const refreshToken = getRefreshToken();
              if (refreshToken) await authService.logout({ refreshToken });
            } catch { /* clear tokens anyway */ }
            clearTokens();
            window.location.href = "/login";
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fef2f2"; (e.currentTarget as HTMLButtonElement).style.color = "#d32f2f"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            onClick={onToggle}
            style={{
              position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)",
              zIndex: 40, transition: "opacity 0.25s ease",
              // Prevent iOS from scrolling the page behind the overlay
              touchAction: "none",
              WebkitOverflowScrolling: "auto" as React.CSSProperties["WebkitOverflowScrolling"],
            }}
          />
        )}
        {sidebar}
      </>
    );
  }

  return sidebar;
}
