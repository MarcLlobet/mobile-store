"use client";

import { EmptyState } from "@/components/listing/EmptyState";
import { PhoneGrid } from "@/components/listing/PhoneGrid";
import { ResultsCount } from "@/components/listing/ResultsCount";
import { SearchBar } from "@/components/listing/SearchBar";
import { useTranslation } from "@/i18n";
import type { ProductListItem } from "@/lib/api/types";
import type { SearchTree } from "@/lib/search";

import styles from "./PhoneListing.module.css";
import { useProductSearch } from "./useProductSearch";

export interface PhoneListingProps {
  catalog: readonly ProductListItem[];
  searchTree: SearchTree;
  initialCount?: number;
}

export const PhoneListing = ({ catalog, searchTree, initialCount }: PhoneListingProps) => {
  const { query, products, search } = useProductSearch(catalog, searchTree, { initialCount });
  const { t } = useTranslation();

  return (
    <section className={styles.listing}>
      <h1 className="visually-hidden">{t("listing.heading")}</h1>
      <SearchBar onSearch={search} />
      <ResultsCount count={products.length} />
      {products.length === 0 ? <EmptyState query={query} /> : <PhoneGrid products={products} />}
    </section>
  );
};
