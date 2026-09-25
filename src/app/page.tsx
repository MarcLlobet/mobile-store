import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { listingQuery } from "@/lib/api/queries";
import { makeQueryClient } from "@/lib/query";
import { PhoneListing } from "@/components/listing/PhoneListing";

/**
 * Listing view ("/"). Server Component — under `output:'export'` this runs
 * once at build time (SSG, not per-request SSR; see next.config.ts and the
 * README "Architecture" section), so the first 20 products are baked into the
 * HTML and the page never ships an empty first paint.
 *
 * Rather than passing them down as a prop, the fetch goes through React Query
 * and the resulting cache is serialized into `<HydrationBoundary>`. The
 * browser cache therefore starts out already holding the `search=""` query
 * that `PhoneListing` reads, so mount does not re-request what the build
 * already fetched — and from then on React Query owns every real-time search
 * request, deduplicating and caching them.
 */
export default async function HomePage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery(listingQuery());

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PhoneListing />
      </HydrationBoundary>
    </main>
  );
}
