import { ViewTransition } from "react";

import { Page } from "@/components/layout/Page";
import { PhoneListing } from "@/components/listing/PhoneListing";
import { getCatalog } from "@/lib/api/getCatalog";
import { buildSearchTree } from "@/lib/search";

const HomePage = async () => {
  const catalog = await getCatalog();
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
