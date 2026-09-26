"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { LISTING_LIMIT } from "@/lib/api/catalog";
import type { ProductListItem } from "@/lib/api/types";
import { getSearchResults, type SearchTree } from "@/lib/search";
import { debounce } from "@/lib/utils/schedule";

export const SEARCH_DEBOUNCE_MS = 250;

export interface UseProductSearchOptions {
  initialCount?: number;
  delayMs?: number;
}

export interface UseProductSearchResult {
  query: string;
  products: readonly ProductListItem[];
  search: (query: string) => void;
}

export const useProductSearch = (
  catalog: readonly ProductListItem[],
  searchTree: SearchTree,
  { initialCount = LISTING_LIMIT, delayMs = SEARCH_DEBOUNCE_MS }: UseProductSearchOptions = {},
): UseProductSearchResult => {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");

  const scheduled = useMemo(
    () =>
      debounce((next: string) => {
        setTerm(next);
      }, delayMs),
    [delayMs],
  );

  useEffect(() => scheduled.cancel, [scheduled]);

  const search = useCallback(
    (next: string) => {
      setQuery(next);
      const trimmed = next.trim();
      if (trimmed === "") {
        scheduled.cancel();
        setTerm("");
        return;
      }
      scheduled.run(trimmed);
    },
    [scheduled],
  );

  const products = useMemo(
    () =>
      term === "" ? catalog.slice(0, initialCount) : getSearchResults(searchTree, catalog, term),
    [term, catalog, searchTree, initialCount],
  );

  return { query, products, search };
};
