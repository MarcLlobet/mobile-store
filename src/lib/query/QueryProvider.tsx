"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./queryClient";

/**
 * Mounted once in the root layout so every Client Component in the app —
 * the listing's real-time search, the detail view — reads from one browser
 * cache. Each route's Server Component prefetches into a throwaway client
 * and hands the result down through `<HydrationBoundary>`; this provider is
 * what that state hydrates into.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
