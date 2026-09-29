import { describe, expect, it } from "vitest";

import { products } from "@mocks/fixtures";

import { buildSearchTree, getSearchResults, getWords } from ".";

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

describe("buildSearchTree", () => {
  it("indexes every prefix of a word, shortest first", () => {
    expect(buildSearchTree([tinyProduct("Ab", "Cd")], ["brand", "name"])).toEqual({
      a: [0],
      ab: [0],
      c: [0],
      cd: [0],
    });
  });

  it("collapses a prefix a product reaches twice into a single position", () => {
    expect(buildSearchTree([tinyProduct("Sa", "St")], ["brand", "name"])).toEqual({
      s: [0],
      sa: [0],
      st: [0],
    });
  });

  it("lists every product that shares a prefix, in catalogue order", () => {
    const first = tinyProduct("Ab", "Xy");
    const second = tinyProduct("Ac", "Zz");

    expect(buildSearchTree([first, second], ["brand"]).a).toEqual([0, 1]);
  });

  it("splits a multi-word prop into a prefix run per word", () => {
    expect(Object.keys(buildSearchTree([tinyProduct("Ab", "Cd Ef")], ["name"]))).toEqual([
      "c",
      "cd",
      "e",
      "ef",
    ]);
  });

  it("indexes only the props it is asked for", () => {
    const byBrandOnly = buildSearchTree(mockProducts, ["brand"]);

    expect(Object.keys(byBrandOnly)).not.toContain("galaxy");
    expect(byBrandOnly.samsung).toEqual([0, 1]);
  });

  it("skips props that do not hold a string", () => {
    expect(buildSearchTree([tinyProduct("Ab", "Cd")], ["basePrice"])).toEqual({});
  });

  it("returns nothing when there are no products", () => {
    expect(buildSearchTree([], ["brand"])).toEqual({});
  });

  it("returns nothing when there are no props to index", () => {
    expect(buildSearchTree([tinyProduct("Ab", "Cd")], [])).toEqual({});
  });

  it("stores positions, not products, which is what keeps the payload small", () => {
    const tree = buildSearchTree(mockProducts, SEARCH_PROPS);

    expect(tree.samsung).toEqual([0, 1]);
    expect(tree.google).toEqual([2]);
    expect(tree.ultra).toEqual([0]);
  });

  it("indexes every prefix of every word across the props it is given", () => {
    expect(buildSearchTree(mockProducts, SEARCH_PROPS)).toEqual({
      s: [0, 1],
      sa: [0, 1],
      sam: [0, 1],
      sams: [0, 1],
      samsu: [0, 1],
      samsun: [0, 1],
      samsung: [0, 1],

      g: [0, 1, 2],
      ga: [0, 1],
      gal: [0, 1],
      gala: [0, 1],
      galax: [0, 1],
      galaxy: [0, 1],

      s2: [0],
      s24: [0],
      u: [0],
      ul: [0],
      ult: [0],
      ultr: [0],
      ultra: [0],

      a: [1],
      a2: [1],
      a25: [1],
      "5": [1],
      "5g": [1],

      go: [2],
      goo: [2],
      goog: [2],
      googl: [2],
      google: [2],
      p: [2],
      pi: [2],
      pix: [2],
      pixe: [2],
      pixel: [2],
      "8": [2],
      "8a": [2],
    });
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
