import type { ProductListItem } from "../api/types";

export type SearchTree = Readonly<Record<string, readonly number[]>>;

const DEFAULT_SEARCH_PROPS: readonly (keyof ProductListItem)[] = ["brand", "name"];

interface PrefixEntry {
  prefix: string;
  product: ProductListItem;
}

const normalize = (value: string): string => value.toLowerCase().trim();

export const getWords = (value: string): readonly string[] =>
  normalize(value).split(/\s+/u).filter(Boolean);

const prefixesOf = (word: string): readonly string[] =>
  Array.from({ length: word.length }, (_unused, position) => word.slice(0, position + 1));

const wordsOf = (
  product: ProductListItem,
  searchProps: readonly (keyof ProductListItem)[],
): readonly string[] =>
  searchProps
    .map((prop) => product[prop])
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => getWords(value));

const generatePrefixedList = (
  products: readonly ProductListItem[],
  searchProps: readonly (keyof ProductListItem)[],
): readonly PrefixEntry[] =>
  products.flatMap((product) =>
    wordsOf(product, searchProps).flatMap((word) =>
      prefixesOf(word).map((prefix) => ({ prefix, product })),
    ),
  );

export const buildSearchTree = (
  products: readonly ProductListItem[],
  searchProps: readonly (keyof ProductListItem)[] = DEFAULT_SEARCH_PROPS,
): SearchTree => {
  const positionOf = new Map(products.map((product, index) => [product, index]));

  return Object.fromEntries(
    [...Map.groupBy(generatePrefixedList(products, searchProps), (entry) => entry.prefix)].map(
      ([prefix, entries]) => [
        prefix,
        [...new Set(entries.map((entry) => positionOf.get(entry.product)))].filter(
          (position): position is number => position !== undefined,
        ),
      ],
    ),
  );
};

const at = (
  products: readonly ProductListItem[],
  positions: readonly number[],
): readonly ProductListItem[] =>
  positions
    .map((position) => products[position])
    .filter((product): product is ProductListItem => product !== undefined);

const positionsFor = (tree: SearchTree, word: string): readonly number[] | undefined =>
  Object.hasOwn(tree, word) ? tree[word] : undefined;

export const getSearchResults = (
  tree: SearchTree,
  products: readonly ProductListItem[],
  searchKey: string,
): readonly ProductListItem[] => {
  const words = getWords(searchKey);

  const matches = words
    .map((word) => positionsFor(tree, word))
    .filter((positions): positions is readonly number[] => positions !== undefined);

  if (words.length === 0 || matches.length !== words.length) {
    return [];
  }

  const [narrowest, ...rest] = matches.toSorted((a, b) => a.length - b.length);

  return at(
    products,
    (narrowest ?? []).filter((position) => rest.every((positions) => positions.includes(position))),
  );
};
