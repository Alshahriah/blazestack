import type { ButtonProps } from "../types";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface WebButtonProps extends ButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  onClick,
  type = "button",
  className = "",
}: WebButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
