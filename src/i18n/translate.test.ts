import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./config";
import en from "./messages/en.json";
import { createTranslator, getServerTranslator } from "./translate";

describe("createTranslator", () => {
  const { t, plural, locale } = createTranslator();

  it("defaults to the default locale", () => {
    expect(locale).toBe(DEFAULT_LOCALE);
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  });

  it("returns the catalogue entry for a key", () => {
    expect(t("cart.total")).toBe("Total");
  });

  it("fills placeholders from params", () => {
    expect(t("cart.remove_label", { name: "iPhone 15" })).toBe("Remove iPhone 15 from cart");
  });

  it("fills several placeholders in one message", () => {
    expect(t("cart.item_variant", { storage: "256GB", color: "Black" })).toBe("256GB | Black");
  });

  it("accepts numbers as well as strings", () => {
    expect(t("cart.heading", { count: 3 })).toBe("Cart (3)");
  });

  it("leaves an unsupplied placeholder visible rather than blanking it", () => {
    expect(t("cart.remove_label")).toBe("Remove {name} from cart");
  });

  describe("plural", () => {
    it("uses the opt-in zero form when the count is zero", () => {
      expect(plural("listing.results", 0)).toBe("No results");
    });

    it("uses the one form for a single item", () => {
      expect(plural("listing.results", 1)).toBe("1 result");
    });

    it("uses the other form for everything else", () => {
      expect(plural("listing.results", 7)).toBe("7 results");
    });

    it("falls back to the other form when a set declares no zero variant", () => {
      expect(plural("header.cart_label", 0)).toBe("Cart, 0 items");
    });

    it("passes count through so the message can interpolate it", () => {
      expect(plural("header.cart_label", 1)).toBe("Cart, 1 item");
    });
  });
});

describe("createTranslator('es')", () => {
  const { t, plural, locale } = createTranslator("es");

  it("reports the locale it was built for", () => {
    expect(locale).toBe("es");
  });

  it("returns the Spanish entry for a key", () => {
    expect(t("cart.continue_shopping")).toBe("Seguir comprando");
  });

  it("interpolates into the Spanish message, not the English one", () => {
    expect(t("cart.remove_label", { name: "iPhone 15" })).toBe("Eliminar iPhone 15 del carrito");
  });

  it("pluralises in Spanish", () => {
    expect(plural("listing.results", 0)).toBe("Sin resultados");
    expect(plural("listing.results", 1)).toBe("1 resultado");
    expect(plural("listing.results", 7)).toBe("7 resultados");
  });

  it("uses locale-specific punctuation where the translation calls for it", () => {
    expect(t("listing.empty_for_query", { query: "nokia" })).toBe(
      "Ningún teléfono coincide con «nokia».",
    );
  });
});

describe("getServerTranslator", () => {
  it("resolves against the default locale, for server components and metadata", () => {
    expect(getServerTranslator().locale).toBe(DEFAULT_LOCALE);
    expect(getServerTranslator().t("meta.title")).toBe("Mobile Store");
  });
});

describe("the catalogue", () => {
  it("declares an `_other` variant for every plural set", () => {
    const pluralBases = Object.keys(en)
      .filter((key) => /_(?:zero|one|two|few|many)$/u.test(key))
      .map((key) => key.replace(/_(?:zero|one|two|few|many)$/u, ""));

    new Set(pluralBases).forEach((base) => {
      expect(Object.keys(en)).toContain(`${base}_other`);
    });
  });

  it("has no blank messages", () => {
    const blank = Object.entries(en)
      .filter(([, value]) => value.trim() === "")
      .map(([key]) => key);

    expect(blank).toEqual([]);
  });
});
