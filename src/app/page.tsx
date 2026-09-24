import { fetchProducts } from "@/lib/api/api";
import { PhoneListing } from "@/components/listing/PhoneListing";

const LISTING_LIMIT = 20;

/**
 * Listing view ("/"). Server Component - under `output:'export'` this runs
 * once at build time (SSG, not per-request SSR; see next.config.ts and the
 * plan's "no backend + GitHub Pages" section), fetching the first 20
 * products so the page never ships an empty first paint. Live, real-time
 * search from here on is handled client-side by `PhoneListing`.
 */
export default async function HomePage() {
  const initialProducts = await fetchProducts({ limit: LISTING_LIMIT, offset: 0 });

  return (
    <main>
      <PhoneListing initialProducts={initialProducts} />
    </main>
  );
}
