import { Skeleton } from "@/components/primitives/Skeleton";

import styles from "./loading.module.css";

const SKELETON_TILE_COUNT = 20;

const Loading = () => (
  <main>
    <section className={styles.listing} aria-busy="true" aria-label="Loading phones">
      <div className={styles.searchSkeleton}>
        <Skeleton height={40} radius={8} ariaLabel="Loading search" />
      </div>
      <Skeleton width={120} height={16} />
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- `list-style: none` drops
            list semantics in Safari/VoiceOver; the explicit role restores them. */}
      <ul className={styles.grid} role="list">
        {Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => (
          <li key={index}>
            <Skeleton height="100%" radius={8} />
          </li>
        ))}
      </ul>
    </section>
  </main>
);

export default Loading;
