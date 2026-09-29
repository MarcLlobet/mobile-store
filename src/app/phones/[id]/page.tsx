import { ViewTransition } from "react";

import { notFound } from "next/navigation";

import { PhoneDetailView } from "@/components/detail/PhoneDetailView";
import { fetchProductById } from "@/lib/api/api";
import { getCatalog } from "@/lib/api/getCatalog";

export const generateStaticParams = async (): Promise<{ id: string }[]> => {
  const products = await getCatalog();
  const uniqueIds = new Set(products.map((product) => product.id));
  return [...uniqueIds].map((id) => ({ id }));
};

const PhoneDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <ViewTransition exit="page-exit">
      <PhoneDetailView product={product} />
    </ViewTransition>
  );
};

export default PhoneDetailPage;
