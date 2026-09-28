import { ViewTransition } from "react";

import { Page } from "@/components/layout/Page";
import { PhoneListing } from "@/components/listing/PhoneListing";
import { fetchProducts } from "@/lib/api/api";
import { CATALOG_SIZE } from "@/lib/api/catalog";
import { buildSearchTree } from "@/lib/search";

const HomePage = async () => {
  const catalog = await fetchProducts({ limit: CATALOG_SIZE, offset: 0 });
  const searchTree = buildSearchTree(catalog);

  return (
    <ViewTransition exit="page-exit">
      <Page>
        <PhoneListing catalog={catalog} searchTree={searchTree} />
      </Page>
    </ViewTransition>
  );
};

export default HomePage;
