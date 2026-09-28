import { Page } from "@/components/layout/Page";
import { Skeleton } from "@/components/primitives/Skeleton";
import { getServerTranslator } from "@/i18n";

import styles from "./loading.module.css";

const SKELETON_TILE_COUNT = 20;

const Loading = () => {
  const { t } = getServerTranslator();

  return (
    <Page className={styles.listing} ariaBusy ariaLabel={t("listing.loading_label")}>
      <Skeleton height={40} radius={8} ariaLabel={t("listing.loading_search_label")} />
      <Skeleton width={120} height={16} />
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ul className={styles.grid} role="list">
        {Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => (
          <li key={index}>
            <Skeleton height="100%" radius={8} />
          </li>
        ))}
      </ul>
    </Page>
  );
};

export default Loading;
