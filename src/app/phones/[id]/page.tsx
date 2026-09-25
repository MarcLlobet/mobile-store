import { notFound } from "next/navigation";

import { HydrationBoundary } from "@tanstack/react-query";

import { PhoneDetail } from "@/components/detail/PhoneDetail";
import { productQuery, productsQuery } from "@/lib/api/queries";
import { fetchAndDehydrate } from "@/lib/query";

const CATALOG_SIZE = 24;

export const generateStaticParams = async (): Promise<{ readonly id: string }[]> => {
  const { data: products } = await fetchAndDehydrate(
    productsQuery({ limit: CATALOG_SIZE, offset: 0 }),
  );
  const uniqueIds = new Set(products.map((product) => product.id));
  return Array.from(uniqueIds, (id) => ({ id }));
};

const PhoneDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { data: product, state } = await fetchAndDehydrate(productQuery(id));

  if (!product) {
    notFound();
  }

  return (
    <HydrationBoundary state={state}>
      <PhoneDetail id={id} />
    </HydrationBoundary>
  );
};

export default PhoneDetailPage;
