import { describe, expect, it } from "vitest";

import { PRODUCT_WITH_DETAIL_ID, invalidKeyError, productDetail, products } from "@mocks/fixtures";
import { getProduct, getProducts } from "@mocks/handlers";
import { server } from "@mocks/server";

import { ApiError, fetchProductById, fetchProducts } from "./api";
import { normalizeProductDetail } from "./transform";

const HTTPS_HOST = "https://prueba-tecnica-api-tienda-moviles.onrender.com";

describe("fetchProducts", () => {
  it("returns the recorded catalog shape", async () => {
    const result = await fetchProducts();

    expect(result).toHaveLength(products.length);
    expect(result[0]).toEqual({
      id: "SMG-S24U",
      brand: "Samsung",
      name: "Galaxy S24 Ultra",
      basePrice: 1329,
      imageUrl: `${HTTPS_HOST}/images/SMG-S24U-titanium-violet.webp`,
    });
  });

  it("upgrades every image url to https so nothing downstream has to", async () => {
    const result = await fetchProducts();

    expect(result.every((product) => product.imageUrl.startsWith("https://"))).toBe(true);
    expect(products.some((product) => product.imageUrl.startsWith("http://"))).toBe(true);
  });

  it("sends the x-api-key header the brief requires", async () => {
    let sentKey: string | null = null;
    server.events.on("request:start", ({ request }) => {
      sentKey = request.headers.get("x-api-key");
    });

    await fetchProducts();

    expect(sentKey).toBe("test-api-key");
  });

  it("filters server-side on `search`, matching name or brand", async () => {
    const byName = await fetchProducts({ search: "Galaxy S24 Ultra" });
    expect(byName.map((product) => product.id)).toEqual(["SMG-S24U"]);

    const byBrand = await fetchProducts({ search: "Google" });
    expect(byBrand.every((product) => product.brand === "Google")).toBe(true);
    expect(byBrand.length).toBeGreaterThan(0);
  });

  it("matches `search` case-insensitively — recorded brands mix casing", async () => {
    const result = await fetchProducts({ search: "xiaomi" });
    const brands = new Set(result.map((product) => product.brand));

    expect(brands).toContain("Xiaomi");
    expect(brands).toContain("XIAOMI");
  });

  it("returns an empty array — not an error — when nothing matches", async () => {
    await expect(fetchProducts({ search: "zzzz-no-such-phone" })).resolves.toEqual([]);
  });

  it("pages with `limit` and `offset`", async () => {
    const firstPage = await fetchProducts({ limit: 20, offset: 0 });
    expect(firstPage).toHaveLength(20);

    const secondPage = await fetchProducts({ limit: 20, offset: 20 });
    expect(secondPage).toHaveLength(products.length - 20);
    expect(secondPage[0]!.id).toBe(products[20]!.id);
  });

  it("surfaces an invalid API key as an ApiError carrying the API's own code", async () => {
    server.use(getProducts({ body: invalidKeyError, status: 401 }));

    await expect(fetchProducts()).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "UNAUTHORIZED",
      message: expect.stringContaining("Invalid API key") as string,
    });
  });

  it("retries a 5xx before giving up, then throws", async () => {
    server.use(getProducts({ status: 503 }));

    const error = await fetchProducts().catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(503);
  }, 15_000);
});

describe("fetchProductById", () => {
  it("returns the recorded detail shape, which carries no top-level imageUrl", async () => {
    const result = await fetchProductById(PRODUCT_WITH_DETAIL_ID);

    expect(result).toEqual(normalizeProductDetail(productDetail));
    expect(result).not.toHaveProperty("imageUrl");
    expect(result?.colorOptions.length).toBeGreaterThan(0);
    (result?.colorOptions ?? []).forEach((color) => {
      expect(color.imageUrl).toMatch(/^https:\/\//);
    });
  });

  it("exposes storage prices as absolute values that can undercut basePrice", async () => {
    const result = await fetchProductById(PRODUCT_WITH_DETAIL_ID);

    expect(result?.basePrice).toBe(1329);
    expect(result?.storageOptions).toEqual([
      { capacity: "256 GB", price: 1229 },
      { capacity: "512 GB", price: 1329 },
      { capacity: "1 TB", price: 1529 },
    ]);
  });

  it("embeds similarProducts in the same response", async () => {
    const result = await fetchProductById(PRODUCT_WITH_DETAIL_ID);

    expect(result?.similarProducts.length).toBeGreaterThan(0);
    expect(result?.similarProducts[0]).toHaveProperty("imageUrl");
  });

  it("upgrades every image url to https before the payload leaves this layer", async () => {
    const result = await fetchProductById(PRODUCT_WITH_DETAIL_ID);

    (result?.colorOptions ?? []).forEach((color) => {
      expect(color.imageUrl.startsWith("https://")).toBe(true);
    });
    (result?.similarProducts ?? []).forEach((similar) => {
      expect(similar.imageUrl.startsWith("https://")).toBe(true);
    });
    expect(productDetail.colorOptions.some((c) => c.imageUrl.startsWith("http://"))).toBe(true);
  });

  it("resolves to null on a 404 so the route can render its not-found state", async () => {
    await expect(fetchProductById("NO-SUCH-PHONE")).resolves.toBeNull();
  });

  it("still throws for a non-404 failure", async () => {
    server.use(getProduct({ body: invalidKeyError, status: 401 }));

    await expect(fetchProductById(PRODUCT_WITH_DETAIL_ID)).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("throws rather than returning null when the detail endpoint 5xxs", async () => {
    server.use(getProduct({ status: 500 }));

    const error = await fetchProductById(PRODUCT_WITH_DETAIL_ID).catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500 });
  }, 15_000);

  it("treats an empty catalogue as a valid answer, not a failure", async () => {
    server.use(getProducts({ body: [] }));

    await expect(fetchProducts()).resolves.toEqual([]);
  });

  it("url-encodes the id", async () => {
    const requested: string[] = [];
    server.events.on("request:start", ({ request }) => {
      requested.push(request.url);
    });

    await fetchProductById("a/b c");

    expect(requested[0]).toContain("/products/a%2Fb%20c");
  });
});
