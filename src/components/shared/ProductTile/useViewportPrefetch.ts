"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { debounce } from "@/lib/utils/schedule";

export const VIEWPORT_PREFETCH_DELAY_MS = 400;

export const useViewportPrefetch = (href: string) => {
  const router = useRouter();
  const anchor = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = anchor.current;
    if (!element) {
      return;
    }

    const scheduled = debounce(() => {
      router.prefetch(href);
      observer.disconnect();
    }, VIEWPORT_PREFETCH_DELAY_MS);

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        scheduled.run();
        return;
      }
      scheduled.cancel();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      scheduled.cancel();
    };
  }, [href, router]);

  return anchor;
};
