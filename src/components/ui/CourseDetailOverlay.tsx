import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CircleCheck } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { getAccessToken } from "../../services/tokenService";
import { enrollmentService } from "../../services/enrollmentservice";

// TODO: replace with the real trackId for this course.
const TRACK_ID = 1;

const POST_LOGIN_INTENT_KEY = "postLoginIntent";

interface CourseDetailOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after enrollment is confirmed (newly enrolled, or already enrolled). */
  onEnroll?: () => void;
}

const learningPoints = [
  "Lead school improvement strategies",
  "Manage staff performance effectively",
  "Apply data-driven decision making",
  "Build community & stakeholder trust",
  "Navigate policy & regulatory frameworks",
  "Drive curriculum quality & compliance",
];

export default function CourseDetailOverlay({
  isOpen,
  onClose,
  onEnroll,
}: CourseDetailOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEnroll = async () => {
    // Not logged in — remember what they were trying to do, then send them to login.
    // The OTP success handler should check this key and resume the enrollment
    // (see the snippet provided separately, since that file wasn't available here).
    if (!getAccessToken()) {
      sessionStorage.setItem(
        POST_LOGIN_INTENT_KEY,
        JSON.stringify({ intent: "enroll", trackId: TRACK_ID })
      );
      window.location.href = "/login";
      return;
    }

    try {
      // Check first so we don't try to re-enroll someone who already is.
      const existing = await enrollmentService.getEnrollment(TRACK_ID);
      if (!existing) {
        await enrollmentService.enroll(TRACK_ID);
      }
      onEnroll?.();
      onClose();
      window.location.href = "/dashboard?nav=courses";
    } catch (err) {
      // TODO: surface this to the user via your toast/error UI instead of just logging.
      console.error("Enrollment failed:", err);
    }
  };

  return createPortal(
    <div
      className="fixed flex items-center justify-center p-6"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 999999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border w-full flex flex-col"
        style={{
          borderColor: "var(--color-border-tertiary, #e5e7eb)",
          maxWidth: "480px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 pt-4 pb-3 flex items-start justify-between gap-4 shrink-0"
          style={{ borderBottom: "0.5px solid var(--color-border-tertiary, #e5e7eb)" }}
        >
          <div>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge color="neutral">TRCN Accredited</Badge>
              <Badge color="neutral">7 tracks</Badge>
              <Badge color="neutral">Certificate Awarded</Badge>
            </div>
            <p className="font-body font-semibold text-tertiary-800 text-base sm:text-lg leading-relaxed">
              School Leadership Certification Programme
            </p>
            <p className="font-body text-neutral-600 text-[11px]">
              A structured pathway for Nigeria's school leaders
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1 text-neutral-800 rounded transition-colors hover:bg-neutral-200 cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-3 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold font-body mb-1.5 text-tertiary-500">
              What you'll learn
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {learningPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-1.5 text-[11px] font-body text-neutral-600"
                >
                  <CircleCheck size={12} color="#3B6D11" className="shrink-0 mt-0.5" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-tertiary-500 font-semibold font-body mb-1.5">
              Who should enroll
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Principals & Head Teachers",
                "Vice Principals",
                "School Proprietors",
                "Education Officers",
              ].map((item) => (
                <span
                  key={item}
                  className="text-[11px] rounded p-1 font-body text-neutral-700 border"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className="px-5 py-3 shrink-0"
          style={{ borderTop: "0.5px solid var(--color-border-tertiary, #e5e7eb)" }}
        >
          <Button
            variant="primary"
            size="md"
            className="w-full rounded justify-center"
            onClick={handleEnroll}
          >
            Enroll
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}