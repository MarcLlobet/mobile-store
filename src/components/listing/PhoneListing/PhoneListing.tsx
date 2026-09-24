"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProducts } from "@/lib/api/api";
import type { ProductListItem } from "@/lib/api/types";
import { SearchBar } from "@/components/listing/SearchBar";
import { ResultsCount } from "@/components/listing/ResultsCount";
import { PhoneGrid } from "@/components/listing/PhoneGrid";
import { EmptyState } from "@/components/listing/EmptyState";
import styles from "./PhoneListing.module.css";

const LISTING_LIMIT = 20;

export interface PhoneListingProps {
  /** SSG-fetched at build time (see app/page.tsx) - first paint never blocks on the network. */
  initialProducts: ProductListItem[];
}

/**
 * Client-side orchestrator for the listing view (brief §1). Owns the
 * debounced search query and re-fetches `fetchProducts({search})` from the
 * external API on every real change - the initial products passed in from
 * the server are rendered as-is and never re-fetched on mount, since they
 * already represent `search=""`/`limit=20`/`offset=0`.
 */
export function PhoneListing({ initialProducts }: PhoneListingProps) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isFirstRun = useRef(true);

  const handleSearch = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      // The very first render already has the SSG-fetched products for
      // search="" - skip the redundant duplicate network call on mount.
      isFirstRun.current = false;
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setHasError(false);

    fetchProducts({ search: query, limit: LISTING_LIMIT, offset: 0 })
      .then((results) => {
        if (isActive) {
          setProducts(results);
        }
      })
      .catch(() => {
        if (isActive) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [query]);

  return (
    <section className={styles.listing}>
      <SearchBar onSearch={handleSearch} />
      <ResultsCount count={products.length} isLoading={isLoading} />
      {hasError ? (
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
