import type { ReactNode } from "react";

import styles from "./Button.module.css";

export interface ButtonProps {
  variant: "primary" | "standard";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  children: ReactNode;
}

export const Button = ({
  variant,
  disabled = false,
  onClick,
  type = "button",
  ariaLabel,
  children,
}: ButtonProps) => (
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
