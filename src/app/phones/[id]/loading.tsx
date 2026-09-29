import { Skeleton } from "@/components/primitives/Skeleton";
import { getServerTranslator } from "@/i18n";

import styles from "./loading.module.css";

const PhoneDetailLoading = () => {
  const { t } = getServerTranslator();

  return (
    <div
      className={styles.layout}
      role="status"
      aria-busy="true"
      aria-label={t("detail.loading_label")}
    >
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
};

export default PhoneDetailLoading;
