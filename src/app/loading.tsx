import { Skeleton } from "@/components/primitives/Skeleton";
import styles from "./loading.module.css";

const SKELETON_TILE_COUNT = 20;

/**
 * Route-level loading state for "/" (Next.js renders this automatically
 * while the listing Server Component is resolving, e.g. on a client-side
 * navigation back to the listing view). Mirrors Figma's listing "Loading"
 * state conceptually: a skeleton search bar, results indicator and grid of
 * `SKELETON_TILE_COUNT` (= the first-20 page size) card placeholders.
 */
export default function Loading() {
  return (
    <main>
      <section className={styles.listing} aria-busy="true" aria-label="Loading phones">
        <div className={styles.searchSkeleton}>
          <Skeleton height={40} radius={8} ariaLabel="Loading search" />
        </div>
        <Skeleton width={120} height={16} />
        <ul className={styles.grid} role="list">
          {Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => (
            <li key={index}>
              {/* Height comes from the li, which carries the responsive Figma
                  card box — see loading.module.css. */}
              <Skeleton height="100%" radius={8} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
