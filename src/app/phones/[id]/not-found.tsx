import { getServerTranslator } from "@/i18n";

import styles from "./not-found.module.css";

const PhoneNotFound = () => {
  const { t } = getServerTranslator();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>{t("detail.not_found_heading")}</h1>
      <p className={styles.message}>{t("detail.not_found_message")}</p>
    </div>
  );
};

export default PhoneNotFound;
