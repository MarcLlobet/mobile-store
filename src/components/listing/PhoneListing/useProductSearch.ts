"use client";

import { useEffect, useState } from "react";

import { fetchProducts } from "@/lib/api/api";
import type { ProductListItem } from "@/lib/api/types";
import { debounce } from "@/lib/utils/schedule";

export const LISTING_LIMIT = 20;
const DEFAULT_DEBOUNCE_MS = 300;

export type SearchStatus = "idle" | "searching" | "error";

export interface UseProductSearchOptions {
  debounceMs?: number;
  limit?: number;
}

export interface UseProductSearchResult {
  query: string;
  products: readonly ProductListItem[];
  status: SearchStatus;
  search: (query: string) => void;
}

export const useProductSearch = (
  initialProducts: readonly ProductListItem[],
  { debounceMs = DEFAULT_DEBOUNCE_MS, limit = LISTING_LIMIT }: UseProductSearchOptions = {},
): UseProductSearchResult => {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState<readonly ProductListItem[] | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");

  const term = query.trim();
  const isSearch = term !== "";

  useEffect(() => {
    if (!isSearch) {
      return;
    }

    const controller = new AbortController();

    const scheduled = debounce(() => {
      setStatus("searching");
      fetchProducts({ search: term, limit, offset: 0 }, { signal: controller.signal, retries: 0 })
        .then((results) => {
          if (!controller.signal.aborted) {
            setSearched(results);
            setStatus("idle");
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setStatus("error");
          }
        });
    }, debounceMs);

    scheduled.run();

    return () => {
      scheduled.cancel();
      controller.abort();
    };
  }, [term, isSearch, debounceMs, limit]);

  return {
    query,
    products: isSearch ? (searched ?? initialProducts) : initialProducts,
    status: isSearch ? status : "idle",
    search: setQuery,
  };
};
