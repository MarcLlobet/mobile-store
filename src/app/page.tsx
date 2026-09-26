import { PhoneListing } from "@/components/listing/PhoneListing";
import { LISTING_LIMIT } from "@/components/listing/PhoneListing/useProductSearch";
import { fetchProducts } from "@/lib/api/api";

const HomePage = async () => {
  const products = await fetchProducts({ limit: LISTING_LIMIT, offset: 0 });

  return (
    <main>
      <PhoneListing initialProducts={products} />
    </main>
  );
};

export default HomePage;
