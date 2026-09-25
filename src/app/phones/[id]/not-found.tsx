import styles from "./not-found.module.css";

/**
 * Detail route's 404 state (Figma "Detail / Empty"), rendered by Next.js
 * when `fetchProductById` resolves to `null` (id not found) and the page
 * calls `notFound()`. The way back to the listing is always on screen —
 * the route layout renders the BackButton above this.
 */
export default function PhoneNotFound() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Phone not found</h1>
      <p className={styles.message}>
        We couldn&apos;t find the phone you were looking for. It may have been removed, or the link
        might be incorrect.
      </p>
    </div>
  );
}
