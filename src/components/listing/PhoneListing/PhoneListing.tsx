"use client";

import { EmptyState } from "@/components/listing/EmptyState";
import { PhoneGrid } from "@/components/listing/PhoneGrid";
import { ResultsCount } from "@/components/listing/ResultsCount";
import { SearchBar } from "@/components/listing/SearchBar";
import { useTranslation } from "@/i18n";
import type { ProductListItem } from "@/lib/api/types";

import styles from "./PhoneListing.module.css";
import { useProductSearch } from "./useProductSearch";

export interface PhoneListingProps {
  initialProducts: readonly ProductListItem[];
}

interface ListingResultsProps {
  hasError: boolean;
  products: readonly ProductListItem[];
  query: string;
}

const ListingResults = ({ hasError, products, query }: ListingResultsProps) => {
  const { t } = useTranslation();

  if (hasError) {
    return (
      <p role="alert" className={styles.error}>
        {t("listing.error")}
      </p>
    );
  }
  if (products.length === 0) {
    return <EmptyState query={query} />;
  }
  return <PhoneGrid products={products} />;
};

export const PhoneListing = ({ initialProducts }: PhoneListingProps) => {
  const { query, products, status, search } = useProductSearch(initialProducts);

  return (
    <section className={styles.listing}>
      <SearchBar onSearch={search} />
      <ResultsCount count={products.length} isLoading={status === "searching"} />
      <ListingResults hasError={status === "error"} products={products} query={query} />
    </section>
  );
};
