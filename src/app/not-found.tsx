import Link from "next/link";

import { getServerTranslator } from "@/i18n";

import styles from "./not-found.module.css";

const NotFound = () => {
  const { t } = getServerTranslator();

  return (
    <main className={styles.wrapper}>
      <h1 className={styles.heading}>{t("not_found.heading")}</h1>
      <p className={styles.message}>{t("not_found.message")}</p>
      <Link href="/" className={styles.link}>
        {t("not_found.back")}
      </Link>
    </main>
  );
};

export default NotFound;
