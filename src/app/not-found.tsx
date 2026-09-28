import Link from "next/link";

import { getServerTranslator } from "@/i18n";

const NotFound = () => {
  const { t } = getServerTranslator();

  return (
    <main className="not-found">
      <h1 className="not-found-heading">{t("not_found.heading")}</h1>
      <p className="not-found-message">{t("not_found.message")}</p>
      <Link href="/" className="not-found-link">
        {t("not_found.back")}
      </Link>
    </main>
  );
};

export default NotFound;
