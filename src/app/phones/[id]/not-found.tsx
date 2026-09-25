import styles from "./not-found.module.css";

const PhoneNotFound = () => (
  <div className={styles.wrapper}>
    <h1 className={styles.heading}>Phone not found</h1>
    <p className={styles.message}>
      We couldn&apos;t find the phone you were looking for. It may have been removed, or the link
      might be incorrect.
    </p>
  </div>
);

export default PhoneNotFound;
