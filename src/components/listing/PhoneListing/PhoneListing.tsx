"use client";

import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listingQuery } from "@/lib/api/queries";
import { SearchBar } from "@/components/listing/SearchBar";
import { ResultsCount } from "@/components/listing/ResultsCount";
import { PhoneGrid } from "@/components/listing/PhoneGrid";
import { EmptyState } from "@/components/listing/EmptyState";
import styles from "./PhoneListing.module.css";

/**
 * Client-side orchestrator for the listing view (brief §1). It owns exactly
 * one piece of state — the debounced search query — and React Query owns
 * everything else: one query per `search` value, keyed by `listingQuery`.
 *
 * Two behaviours fall out of that instead of being hand-written:
 *
 *  - No duplicate fetch on mount. The page prefetched `search=""` at build
 *    time and hydrated it into this exact key (see app/page.tsx), and the
 *    client's `staleTime` keeps it fresh, so the first render is served from
 *    cache. Re-typing an earlier search is a cache hit too.
 *  - `keepPreviousData` holds the previous results on screen while the next
 *    search is in flight, so the grid never blanks out mid-typing. That is
 *    also why the count reads `isFetching` (a background refresh) rather than
 *    `isPending` (no data at all).
 */
export function PhoneListing() {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
  }, []);

  const {
    data: products = [],
    isFetching,
    isError,
  } = useQuery({
    ...listingQuery(query),
    placeholderData: keepPreviousData,
  });

  return (
    <section className={styles.listing}>
      <SearchBar onSearch={handleSearch} />
      <ResultsCount count={products.length} isLoading={isFetching} />
      {isError ? (
        <p role="alert" className={styles.error}>
          Something went wrong loading phones. Please try again.
        </p>
      ) : products.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <PhoneGrid products={products} />
      )}
    </section>
  );
}
