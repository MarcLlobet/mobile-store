"use client";

import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "./queryClient";

export const QueryProvider = ({ children }: { readonly children: ReactNode }) => (
  <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
);
