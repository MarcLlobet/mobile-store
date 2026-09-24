import { notFound } from "next/navigation";
import { fetchProductById, fetchProducts } from "@/lib/api/api";
import { PhoneDetailView } from "@/components/detail/PhoneDetailView";

/**
 * Static export (`output: 'export'`) requires every dynamic route to
 * enumerate its params at build time. The catalog is only 24 items
 * (confirmed live), so one `fetchProducts` call covers it. The live listing
 * can contain duplicate ids (confirmed quirk — see lib/api/types.ts), which
 * would otherwise make Next warn about/generate the same static path twice,
 * so ids are deduped here.
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const products = await fetchProducts({ limit: 24, offset: 0 });
  const uniqueIds = new Set(products.map((product) => product.id));
  return Array.from(uniqueIds, (id) => ({ id }));
}

export default async function PhoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return <PhoneDetailView product={product} />;
}
