"use client";

import { useQuery } from "@tanstack/react-query";
import { productQuery } from "@/lib/api/queries";
import { PhoneDetailView } from "@/components/detail/PhoneDetailView";
import styles from "./PhoneDetail.module.css";

export interface PhoneDetailProps {
  id: string;
}

/**
 * Data boundary for the Detail route: reads the product from React Query so
 * the view below it stays purely presentational (and Storybook-mountable).
 *
 * The route's Server Component prefetched this exact key and hydrated it (see
 * app/phones/[id]/page.tsx), so in practice `data` is already there on the
 * first render — the branches below only come up when the browser later
 * refetches a stale entry and the API has since changed its answer. The
 * route's `loading.tsx` covers the real wait, hence `null` rather than a
 * second skeleton here.
 */
export function PhoneDetail({ id }: PhoneDetailProps) {
  const { data: product, isPending, isError } = useQuery(productQuery(id));

  if (isPending) {
    return null;
  }

  if (isError) {
    return (
      <p role="alert" className={styles.message}>
        Something went wrong loading this phone. Please try again.
      </p>
    );
  }

  // `fetchProductById` resolves to null on a 404, so this is the product
  // having been removed since the page was built — not a failed request.
  if (!product) {
    return (
      <p role="alert" className={styles.message}>
        This phone is no longer available.
      </p>
    );
  }

  return <PhoneDetailView product={product} />;
}
