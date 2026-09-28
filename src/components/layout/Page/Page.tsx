import type { ReactNode } from "react";

import styles from "./Page.module.css";

export type PageWidth = "wide" | "column";

export interface PageProps {
  children: ReactNode;
  width?: PageWidth;
  lead?: ReactNode;
  className?: string;
  role?: "alert";
  ariaBusy?: boolean;
  ariaLabel?: string;
}

export const Page = ({
  children,
  width = "wide",
  lead,
  className,
  role,
  ariaBusy,
  ariaLabel,
}: PageProps) => (
  <main
    className={className === undefined ? styles.page : `${styles.page} ${className}`}
    data-width={width}
    role={role}
    aria-busy={ariaBusy}
    aria-label={ariaLabel}
  >
    {lead === undefined ? null : <div className={styles.lead}>{lead}</div>}
    {width === "column" ? <div className={styles.column}>{children}</div> : children}
  </main>
);
