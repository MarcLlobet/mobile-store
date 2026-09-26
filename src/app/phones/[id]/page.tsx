import { notFound } from "next/navigation";

import { PhoneDetailView } from "@/components/detail/PhoneDetailView";
import { fetchProductById, fetchProducts } from "@/lib/api/api";
import { CATALOG_SIZE } from "@/lib/api/catalog";

export const generateStaticParams = async (): Promise<{ id: string }[]> => {
  const products = await fetchProducts({ limit: CATALOG_SIZE, offset: 0 });
  const uniqueIds = new Set(products.map((product) => product.id));
  return [...uniqueIds].map((id) => ({ id }));
};

const PhoneDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return <PhoneDetailView product={product} />;
};

export default PhoneDetailPage;
