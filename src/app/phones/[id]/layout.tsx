import type { ReactNode } from "react";
import { BackButton } from "@/components/detail/BackButton";
import styles from "./layout.module.css";

/**
 * Shared shell for every `/phones/[id]` route.
 *
 * Next.js layouts are *not* re-rendered on navigation within their segment —
 * they're cached on the client and reused. Putting the `<main>` wrapper and
 * the BackButton here (instead of repeating them in `page`, `loading` and
 * `not-found`, as before) means that clicking through "Similar items" from
 * one phone to another only swaps the page body: the chrome stays mounted,
 * so it never flashes or re-mounts mid-navigation.
 *
 * Because this layout owns the single `<main>` landmark for the segment,
 * `page.tsx`, `loading.tsx` and `not-found.tsx` must each render a fragment
 * or a plain element — never another `<main>` (nested landmarks are invalid
 * HTML and duplicate the landmark for screen readers).
 *
 * The back link and the page content sit in two separate boxes because they
 * align to different things: the link to the page gutter (so it lines up with
 * the header logo, as the Figma frames show), the content to the centred
 * 1200px column.
 */
export default function PhoneDetailLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      {/* Outside `.page` on purpose: the back link belongs to the page gutter,
          directly under the logo, not to the centred 1200px content column
          (which at desktop starts 260px further right). */}
      <div className={styles.backRow}>
        <BackButton />
      </div>
      <div className={styles.page}>{children}</div>
    </main>
  );
}
