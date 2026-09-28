import Link from "next/link";

import { Page } from "@/components/layout/Page";
import { getServerTranslator } from "@/i18n";

const NotFound = () => {
  const { t } = getServerTranslator();

  return (
    <Page className="not-found">
      <h1 className="not-found-heading">{t("not_found.heading")}</h1>
      <p className="not-found-message">{t("not_found.message")}</p>
      <Link href="/" className="not-found-link">
        {t("not_found.back")}
      </Link>
    </Page>
  );
};

export default NotFound;
