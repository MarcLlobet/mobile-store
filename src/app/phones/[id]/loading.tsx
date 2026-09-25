import { Skeleton } from "@/components/primitives/Skeleton";
import styles from "./loading.module.css";

/**
 * Loading/skeleton state for the Detail route (Figma "Detail / Loading").
 * The external API is hosted on Render's free tier, which has real cold
 * starts, so this is exercised for real (not just a theoretical Suspense
 * boundary) during client-side transitions into a not-yet-cached route.
 *
 * The `<main>` box and the BackButton come from the route layout, which
 * stays mounted while this renders — so the back link is already on screen
 * (and clickable) during the wait instead of appearing with the skeleton.
 */
export default function PhoneDetailLoading() {
  return (
    <div className={styles.layout} aria-busy="true" aria-label="Loading phone details">
      <Skeleton width="100%" height={360} radius={8} />
      <div className={styles.info}>
        <Skeleton width={120} height={14} />
        <Skeleton width={240} height={28} />
        <Skeleton width={100} height={22} />
        <Skeleton width="100%" height={48} radius={8} />
        <Skeleton width="100%" height={48} radius={8} />
        <Skeleton width={160} height={44} radius={8} />
      </div>
    </div>
  );
}
