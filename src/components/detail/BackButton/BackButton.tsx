import Link from "next/link";
import { Icon } from "@/components/primitives/Icon";
import styles from "./BackButton.module.css";

/**
 * Detail view's "way back to the listing" control (Figma "Back button").
 * Implemented as a plain link to `/` rather than `router.back()` — a Similar
 * products click, a shared URL, or a direct hit on a detail page all have no
 * meaningful browser-history entry to go back to, so a fixed destination is
 * the only option that "always lands somewhere sensible" per the brief.
 */
export interface BackButtonProps {
  href?: string;
}

export function BackButton({ href = "/" }: BackButtonProps) {
  return (
    <Link href={href} className={styles.link} aria-label="Back to listing">
      <Icon name="back" ariaHidden />
      <span>Back</span>
    </Link>
  );
}
