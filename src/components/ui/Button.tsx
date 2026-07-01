import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outlined"
  | "ghost"
  | "inverted";
type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonType = "button" | "submit" | "reset";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-dark shadow-sm hover:shadow-cta",
  secondary:
    "bg-secondary-500 text-tertiary-500 hover:bg-secondary-dark font-700",
  outlined:
    "border-2 border-tertiary-500 text-tertiary-500 hover:border-primary-500 hover:text-primary-500 bg-transparent",
  ghost: "text-primary-500 hover:bg-primary-50 bg-transparent",
  inverted: "bg-tertiary-500 text-white hover:bg-tertiary-light",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-xs px-3.5 py-2 rounded",
  md: "text-sm px-5 py-2.5 rounded-md",
  lg: "text-sm px-7 py-3.5 rounded-md",
  xl: "text-base px-8 py-4 rounded-lg",
};

interface ButtonBaseProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

interface ButtonAsAnchorProps extends ButtonBaseProps {
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  type?: never;
}

interface ButtonAsButtonProps extends ButtonBaseProps {
  href?: never;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: ButtonType;
}

type ButtonProps = ButtonAsAnchorProps | ButtonAsButtonProps;

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  style,
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 font-body font-600 transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

  const classes = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        className={classes}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type as ButtonType}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      disabled={disabled}
      className={classes}
      style={style}
    >
      {children}
    </button>
  );
}