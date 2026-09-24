import type { ReactNode } from "react";
import styles from "./Button.module.css";

/**
 * Frozen contract (plan §4) — mirrors the Figma "SDS Button" component
 * (variants Primary/Standard, Default/Hover/Active/Disabled states).
 */
export interface ButtonProps {
  variant: "primary" | "standard";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  children: ReactNode;
}

export function Button({
  variant,
  disabled = false,
  onClick,
  type = "button",
  ariaLabel,
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${variant === "primary" ? styles.primary : styles.standard}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
