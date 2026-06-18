import React, { useState, useRef, useEffect, createContext, useContext } from "react";

// ── Context ──────────────────────────────────────────────

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error("DropdownMenu components must be used within DropdownMenu");
  return ctx;
}

// ── Root ─────────────────────────────────────────────────

interface DropdownMenuProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function DropdownMenu({ children, defaultOpen = false }: DropdownMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

// ── Trigger ──────────────────────────────────────────────

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DropdownMenuTrigger({ children, asChild = false }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild) {
    return (
      <span ref={triggerRef as React.RefObject<HTMLSpanElement>} onClick={handleClick} aria-expanded={open}>
        {children}
      </span>
    );
  }

  return (
    <button
      ref={triggerRef}
      onClick={handleClick}
      aria-expanded={open}
      type="button"
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}

// ── Content ───────────────────────────────────────────────

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  align?: "start" | "center" | "end";
}

export function DropdownMenuContent({
  children,
  className = "",
  style,
  align = "start",
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu();
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  // Position alignment
  const alignStyles: Record<string, React.CSSProperties> = {
    start: { left: 0 },
    center: { left: "50%", transform: "translateX(-50%)" },
    end: { right: 0 },
  };

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 min-w-32 overflow-hidden rounded-md border shadow-lg animate-fade-in ${className}`}
      style={{
        top: "calc(100% + 4px)",
        ...alignStyles[align],
        backgroundColor: "#ffffff",
        borderColor: "#e0e0e0",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Item ─────────────────────────────────────────────────

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function DropdownMenuItem({
  children,
  className = "",
  style,
  onClick,
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu();

  const handleClick = () => {
    onClick?.();
    setOpen(false);
  };

  return (
    <div
      className={`cursor-pointer transition-colors duration-150 ${className}`}
      onClick={handleClick}
      style={{
        padding: "8px 12px",
        fontSize: "13px",
        color: "#444444",
        fontWeight: 500,
        lineHeight: 1.4,
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(0,100,0,0.04)";
        (e.currentTarget as HTMLDivElement).style.color = "#006400";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent";
        (e.currentTarget as HTMLDivElement).style.color = "#444444";
      }}
    >
      {children}
    </div>
  );
}

// ── Separator ────────────────────────────────────────────

export function DropdownMenuSeparator({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        height: "1px",
        backgroundColor: "#e8e8e8",
        margin: "4px 0",
      }}
    />
  );
}