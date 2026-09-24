/**
 * Placeholder — the real Detail view (hero image, color/storage selectors,
 * specs, add-to-cart, similar products) is Phase 1's job (see plan §4,
 * workstream B), including the real `generateStaticParams()` fetched from
 * `fetchProducts()`. This stub only exists so the dynamic route is valid
 * under `output: 'export'` (which requires every dynamic route to define
 * `generateStaticParams`) and the app boots during Phase 0.
 */
export function generateStaticParams(): { id: string }[] {
  return [];
}

export default async function PhoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main>
      <p>Phone detail view for &quot;{id}&quot; — coming in Phase 1.</p>
    </main>
  );
}
