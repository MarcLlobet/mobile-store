import { BackButton } from "@/components/detail/BackButton";
import styles from "./not-found.module.css";

/**
 * Detail route's 404 state (Figma "Detail / Empty"), rendered by Next.js
 * when `fetchProductById` resolves to `null` (id not found) and the page
 * calls `notFound()`. Always offers a way back to the listing.
 */
export default function PhoneNotFound() {
  return (
    <main className={styles.wrapper}>
      <BackButton />
      <h1 className={styles.heading}>Phone not found</h1>
      <p className={styles.message}>
        We couldn&apos;t find the phone you were looking for. It may have been removed, or the link
        might be incorrect.
      </p>
    </main>
  );
}
