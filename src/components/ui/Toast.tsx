import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const styles: Record<ToastType, string> = {
  success: "bg-white border-l-4 border-green-500 text-neutral-800",
  error: "bg-white border-l-4 border-red-500 text-neutral-800",
  info: "bg-white border-l-4 border-primary-500 text-neutral-800",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-primary-500",
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Fade out then remove
    const hideTimer = setTimeout(() => setVisible(false), 3500);
    const removeTimer = setTimeout(() => onRemove(toast.id), 4000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-sm shadow-lg min-w-70 max-w-sm
        transition-all duration-300 ease-in-out
        ${styles[toast.type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${iconStyles[toast.type]}`}>
        {icons[toast.type]}
      </span>
      <p className="text-sm font-500 font-body leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-auto shrink-0 text-neutral-400 hover:text-neutral-600"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}