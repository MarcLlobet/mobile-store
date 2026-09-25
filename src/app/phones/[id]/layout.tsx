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
 */
export default function PhoneDetailLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <BackButton />
      {children}
    </main>
  );
}
