import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@mocks/server";
import { scenarios } from "@mocks/handlers";
import { PRODUCT_WITH_DETAIL_ID, productDetail } from "@mocks/fixtures";
import { CartProvider } from "@/context/CartContext";
import { productQuery } from "@/lib/api/queries";
import { createTestQueryClient, renderWithQuery } from "@/test/query";
import { trackRequests } from "@/test/requests";
import { PhoneDetail } from "./PhoneDetail";

/**
 * The data boundary for the Detail route, driven by the recorded
 * `/products/{id}` response through MSW.
 */

const requests = trackRequests();

let queryClient = createTestQueryClient();

function renderDetail(id = PRODUCT_WITH_DETAIL_ID, { seed = true }: { seed?: boolean } = {}) {
  if (seed) {
    queryClient.setQueryData(productQuery(id).queryKey, productDetail);
  }
  return renderWithQuery(<PhoneDetail id={id} />, {
    queryClient,
    wrap: (children) => <CartProvider>{children}</CartProvider>,
  });
}

beforeEach(() => {
  window.localStorage.clear();
  queryClient = createTestQueryClient();
});

describe("PhoneDetail", () => {
  it("renders the product hydrated by the build, without re-fetching", async () => {
    renderDetail();

    expect(screen.getByRole("heading", { level: 1, name: productDetail.name })).toBeInTheDocument();
    await waitFor(() => expect(requests.urls()).toEqual([]));
  });

  it("fetches the product itself when the cache is cold", async () => {
    renderDetail(PRODUCT_WITH_DETAIL_ID, { seed: false });

    expect(
      await screen.findByRole("heading", { level: 1, name: productDetail.name }),
    ).toBeInTheDocument();
    expect(requests.urls()[0]).toContain(`/products/${PRODUCT_WITH_DETAIL_ID}`);
  });

  it("tells the user the phone is gone when the API now answers 404", async () => {
    server.use(...scenarios.productNotFound());
    renderDetail(PRODUCT_WITH_DETAIL_ID, { seed: false });

    expect(await screen.findByRole("alert")).toHaveTextContent("no longer available");
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("shows an error message when the request fails outright", async () => {
    server.use(...scenarios.invalidApiKey());
    renderDetail(PRODUCT_WITH_DETAIL_ID, { seed: false });

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
  });
});
