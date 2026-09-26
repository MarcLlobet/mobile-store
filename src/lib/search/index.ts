import type { ProductListItem } from "../api/types";

type SearchIndex = ReadonlyMap<string, ReadonlySet<ProductListItem>>;

export interface PrefixEntry {
  prefix: string;
  product: ProductListItem;
}

const EMPTY_RESULTS: readonly ProductListItem[] = [];

export const getWords = (text: string): readonly string[] =>
  text.toLocaleLowerCase().trim().split(/\s+/u).filter(Boolean);

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

export const generatePrefixedList = (
  products: readonly ProductListItem[],
  searchProps: readonly (keyof ProductListItem)[],
): readonly PrefixEntry[] =>
  products.flatMap((product) =>
    wordsOf(product, searchProps).flatMap((word) =>
      prefixesOf(word).map((prefix) => ({ prefix, product })),
    ),
  );

const buildIndex = (
  products: readonly ProductListItem[],
  searchProps: readonly (keyof ProductListItem)[],
): SearchIndex =>
  new Map(
    [...Map.groupBy(generatePrefixedList(products, searchProps), ({ prefix }) => prefix)].map(
      ([prefix, entries]) => [prefix, new Set(entries.map(({ product }) => product))],
    ),
  );

// eslint-disable-next-line functional/no-let
let searchIndex: SearchIndex = new Map();

export const getSearchResultsByProps = (
  products: readonly ProductListItem[],
  searchProps: readonly (keyof ProductListItem)[],
): Record<string, ProductListItem[]> => {
  searchIndex = buildIndex(products, searchProps);

  return Object.fromEntries([...searchIndex].map(([prefix, matches]) => [prefix, [...matches]]));
};

export const getSearchResults = (searchKey: string): ProductListItem[] => {
  const words = getWords(searchKey);

  const matches = words
    .map((word) => searchIndex.get(word))
    .filter((products): products is ReadonlySet<ProductListItem> => products !== undefined);

  if (words.length === 0 || matches.length !== words.length) {
    return [...EMPTY_RESULTS];
  }

  const [narrowest, ...rest] = matches.toSorted((a, b) => a.size - b.size);

  return narrowest === undefined
    ? [...EMPTY_RESULTS]
    : [...narrowest].filter((product) => rest.every((products) => products.has(product)));
};
