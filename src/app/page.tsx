import { HydrationBoundary } from "@tanstack/react-query";

import { PhoneListing } from "@/components/listing/PhoneListing";
import { listingQuery } from "@/lib/api/queries";
import { fetchAndDehydrate } from "@/lib/query";

const HomePage = async () => {
  const { state } = await fetchAndDehydrate(listingQuery());

  return (
    <main>
      <HydrationBoundary state={state}>
        <PhoneListing />
      </HydrationBoundary>
    </main>
  );
};

export default HomePage;
