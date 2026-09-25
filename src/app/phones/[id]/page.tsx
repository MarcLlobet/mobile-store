import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { productQuery, productsQuery } from "@/lib/api/queries";
import { makeQueryClient } from "@/lib/query";
import { PhoneDetail } from "@/components/detail/PhoneDetail";

const CATALOG_SIZE = 24;

/**
 * Static export (`output: 'export'`) requires every dynamic route to
 * enumerate its params at build time. The catalog is only 24 items
 * (confirmed live), so one `/products` call covers it. The listing can
 * contain duplicate ids (recorded quirk — see lib/api/types.ts), which would
 * otherwise make Next warn about/generate the same static path twice, so ids
 * are deduped here.
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const queryClient = makeQueryClient();
  const products = await queryClient.fetchQuery(productsQuery({ limit: CATALOG_SIZE, offset: 0 }));
  const uniqueIds = new Set(products.map((product) => product.id));
  return Array.from(uniqueIds, (id) => ({ id }));
}

/**
 * The 404 check has to happen here, in the Server Component: `notFound()`
 * only works on the server, and this is also the only place that can still
 * influence the generated output. Everything past it is hydrated cache —
 * `PhoneDetail` reads the same query key from the browser and so renders
 * from the build's data with no request of its own.
 */
export default async function PhoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = makeQueryClient();
  const product = await queryClient.fetchQuery(productQuery(id));

  if (!product) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PhoneDetail id={id} />
    </HydrationBoundary>
  );
}
