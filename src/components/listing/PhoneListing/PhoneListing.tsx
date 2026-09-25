"use client";

import { useCallback, useState } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/listing/EmptyState";
import { PhoneGrid } from "@/components/listing/PhoneGrid";
import { ResultsCount } from "@/components/listing/ResultsCount";
import { SearchBar } from "@/components/listing/SearchBar";
import { listingQuery } from "@/lib/api/queries";
import type { ProductListItem } from "@/lib/api/types";

import styles from "./PhoneListing.module.css";

interface ListingResultsProps {
  readonly isError: boolean;
  readonly products: readonly ProductListItem[];
  readonly query: string;
}

const ListingResults = ({ isError, products, query }: ListingResultsProps) => {
  if (isError) {
    return (
      <p role="alert" className={styles.error}>
        Something went wrong loading phones. Please try again.
      </p>
    );
  }
  if (products.length === 0) {
    return <EmptyState query={query} />;
  }
  return <PhoneGrid products={products} />;
};

export const PhoneListing = () => {
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
      <ListingResults isError={isError} products={products} query={query} />
    </section>
  );
};
