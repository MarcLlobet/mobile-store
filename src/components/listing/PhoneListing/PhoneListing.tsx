"use client";

import { EmptyState } from "@/components/listing/EmptyState";
import { PhoneGrid } from "@/components/listing/PhoneGrid";
import { ResultsCount } from "@/components/listing/ResultsCount";
import { SearchBar } from "@/components/listing/SearchBar";
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

  return (
    <section className={styles.listing}>
      <SearchBar onSearch={search} />
      <ResultsCount count={products.length} />
      {products.length === 0 ? <EmptyState query={query} /> : <PhoneGrid products={products} />}
    </section>
  );
};
