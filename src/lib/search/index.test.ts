import { describe, expect, it } from "vitest";

import { products } from "@mocks/fixtures";

import {
  buildSearchTree,
  generatePrefixedList,
  getSearchResults,
  getSearchResultsByProps,
  getWords,
} from ".";

import type { ProductListItem } from "../api/types";

const samsungGalaxyS24 = products[0]!;
const samsungGalaxyA25 = products[1]!;
const googlePixel8A = products[2]!;

const mockProducts: ProductListItem[] = [samsungGalaxyS24, samsungGalaxyA25, googlePixel8A];

const SEARCH_PROPS: (keyof ProductListItem)[] = ["brand", "name"];

const tinyProduct = (brand: string, name: string): ProductListItem => ({
  id: `${brand}-${name}`,
  brand,
  name,
  basePrice: 0,
  imageUrl: "",
});

const searchTree = buildSearchTree(mockProducts, SEARCH_PROPS);

describe("the fixtures these expectations are pinned to", () => {
  it("still hold the brands and names the prefix tree below is written for", () => {
    expect(
      [samsungGalaxyS24, samsungGalaxyA25, googlePixel8A].map((p) => `${p.brand} ${p.name}`),
    ).toEqual(["Samsung Galaxy S24 Ultra", "Samsung Galaxy A25 5G", "Google Pixel 8a"]);
  });
});

describe("getWords", () => {
  it("lowercases so the index is built and queried in one case", () => {
    expect(getWords("Galaxy ULTRA")).toEqual(["galaxy", "ultra"]);
  });

  it("splits on any run of whitespace, however wide", () => {
    expect(getWords("samsung    galaxy")).toEqual(["samsung", "galaxy"]);
  });

  it("treats tabs, newlines and non-breaking spaces as separators too", () => {
    expect(getWords("samsung\tgalaxy\ns24\u00A0ultra")).toEqual([
      "samsung",
      "galaxy",
      "s24",
      "ultra",
    ]);
  });

  it("drops surrounding whitespace rather than emitting empty words", () => {
    expect(getWords("   pixel   ")).toEqual(["pixel"]);
  });

  it.each([
    ["an empty string", ""],
    ["whitespace only", " ".repeat(3)],
    ["a newline only", "\n"],
  ])("returns no words for %s", (_case, value) => {
    expect(getWords(value)).toEqual([]);
  });

  it("keeps digits and letters together, so model numbers stay one word", () => {
    expect(getWords("Redmi Note 13 Pro 5G")).toEqual(["redmi", "note", "13", "pro", "5g"]);
  });

  it("does not strip punctuation, which stays glued to its word", () => {
    expect(getWords("A18 (2024)")).toEqual(["a18", "(2024)"]);
  });
});

describe("generatePrefixedList", () => {
  it("emits one entry per prefix, shortest first", () => {
    const product = tinyProduct("Ab", "Cd");

    expect(generatePrefixedList([product], ["brand", "name"])).toEqual([
      { prefix: "a", product },
      { prefix: "ab", product },
      { prefix: "c", product },
      { prefix: "cd", product },
    ]);
  });

  it("walks the props in the order it was given them", () => {
    const product = tinyProduct("Ab", "Cd");

    expect(generatePrefixedList([product], ["name", "brand"]).map((entry) => entry.prefix)).toEqual(
      ["c", "cd", "a", "ab"],
    );
  });

  it("repeats a prefix a product reaches twice, leaving buildIndex to collapse it", () => {
    const product = tinyProduct("Sa", "St");

    expect(generatePrefixedList([product], ["brand", "name"])).toEqual([
      { prefix: "s", product },
      { prefix: "sa", product },
      { prefix: "s", product },
      { prefix: "st", product },
    ]);
  });

  it("emits an entry per product for a prefix they share", () => {
    const first = tinyProduct("Ab", "Xy");
    const second = tinyProduct("Ac", "Zz");

    expect(
      generatePrefixedList([first, second], ["brand"]).filter((entry) => entry.prefix === "a"),
    ).toEqual([
      { prefix: "a", product: first },
      { prefix: "a", product: second },
    ]);
  });

  it("splits a multi-word prop into a prefix run per word", () => {
    const product = tinyProduct("Ab", "Cd Ef");

    expect(generatePrefixedList([product], ["name"]).map((entry) => entry.prefix)).toEqual([
      "c",
      "cd",
      "e",
      "ef",
    ]);
  });

  it("skips props that do not hold a string", () => {
    expect(generatePrefixedList([tinyProduct("Ab", "Cd")], ["basePrice"])).toEqual([]);
  });

  it("returns nothing when there are no products", () => {
    expect(generatePrefixedList([], ["brand"])).toEqual([]);
  });

  it("returns nothing when there are no props to index", () => {
    expect(generatePrefixedList([tinyProduct("Ab", "Cd")], [])).toEqual([]);
  });
});

describe("getSearchResultsByProps", () => {
  it("indexes every prefix of every word across the props it is given", () => {
    const searchResultsByProps = getSearchResultsByProps(mockProducts, SEARCH_PROPS);

    expect(searchResultsByProps).toEqual({
      s: [samsungGalaxyS24, samsungGalaxyA25],
      sa: [samsungGalaxyS24, samsungGalaxyA25],
      sam: [samsungGalaxyS24, samsungGalaxyA25],
      sams: [samsungGalaxyS24, samsungGalaxyA25],
      samsu: [samsungGalaxyS24, samsungGalaxyA25],
      samsun: [samsungGalaxyS24, samsungGalaxyA25],
      samsung: [samsungGalaxyS24, samsungGalaxyA25],

      g: [samsungGalaxyS24, samsungGalaxyA25, googlePixel8A],
      ga: [samsungGalaxyS24, samsungGalaxyA25],
      gal: [samsungGalaxyS24, samsungGalaxyA25],
      gala: [samsungGalaxyS24, samsungGalaxyA25],
      galax: [samsungGalaxyS24, samsungGalaxyA25],
      galaxy: [samsungGalaxyS24, samsungGalaxyA25],

      s2: [samsungGalaxyS24],
      s24: [samsungGalaxyS24],
      u: [samsungGalaxyS24],
      ul: [samsungGalaxyS24],
      ult: [samsungGalaxyS24],
      ultr: [samsungGalaxyS24],
      ultra: [samsungGalaxyS24],

      a: [samsungGalaxyA25],
      a2: [samsungGalaxyA25],
      a25: [samsungGalaxyA25],
      "5": [samsungGalaxyA25],
      "5g": [samsungGalaxyA25],

      go: [googlePixel8A],
      goo: [googlePixel8A],
      goog: [googlePixel8A],
      googl: [googlePixel8A],
      google: [googlePixel8A],
      p: [googlePixel8A],
      pi: [googlePixel8A],
      pix: [googlePixel8A],
      pixe: [googlePixel8A],
      pixel: [googlePixel8A],
      "8": [googlePixel8A],
      "8a": [googlePixel8A],
    });
  });

  it("indexes only the props it is asked for", () => {
    const byBrandOnly = getSearchResultsByProps(mockProducts, ["brand"]);

    expect(Object.keys(byBrandOnly)).not.toContain("galaxy");
    expect(byBrandOnly.samsung).toEqual([samsungGalaxyS24, samsungGalaxyA25]);
  });

  it("skips props that do not hold a string", () => {
    const byPrice = getSearchResultsByProps(mockProducts, ["basePrice"]);

    expect(byPrice).toEqual({});
  });

  it("replaces the previous index rather than accumulating across calls", () => {
    getSearchResultsByProps(mockProducts, SEARCH_PROPS);
    const second = getSearchResultsByProps([googlePixel8A], SEARCH_PROPS);

    expect(second.samsung).toBeUndefined();
    expect(second.google).toEqual([googlePixel8A]);
  });
});

describe("getSearchResults", () => {
  it("returns every product reached by a whole word", () => {
    expect(getSearchResults(searchTree, mockProducts, "Google")).toEqual([googlePixel8A]);
  });

  it("returns every product reached by a prefix", () => {
    expect(getSearchResults(searchTree, mockProducts, "sam")).toEqual([
      samsungGalaxyS24,
      samsungGalaxyA25,
    ]);
  });

  it("ignores case and surrounding whitespace", () => {
    expect(getSearchResults(searchTree, mockProducts, "  GOOGLE  ")).toEqual([googlePixel8A]);
  });

  it("requires every word to match, not just one of them", () => {
    expect(getSearchResults(searchTree, mockProducts, "galaxy ultra")).toEqual([samsungGalaxyS24]);
  });

  it("keeps the products that all words agree on", () => {
    expect(getSearchResults(searchTree, mockProducts, "samsung galaxy")).toEqual([
      samsungGalaxyS24,
      samsungGalaxyA25,
    ]);
  });

  it.each([
    ["a word nothing is indexed under", "nokia"],
    ["one unknown word alongside a known one", "samsung nokia"],
    ["two known words with nothing in common", "samsung pixel"],
    ["an empty query", ""],
    ["a whitespace-only query", " ".repeat(3)],
  ])("returns nothing for %s", (_case, query) => {
    expect(getSearchResults(searchTree, mockProducts, query)).toEqual([]);
  });
});
