"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/context/CartContext";
import type { ColorOption, ProductDetail, StorageOption } from "@/lib/api/types";
import type { CartItem } from "@/types/cart";

export interface ProductSelection {
  color: ColorOption | null;
  storage: StorageOption | null;
}

export interface UseProductSelectionResult {
  selection: ProductSelection;
  heroColor: ColorOption | null;
  selectColor: (color: ColorOption) => void;
  selectStorage: (storage: StorageOption) => void;
}

const colorFromCart = (product: ProductDetail, line: CartItem | undefined): ColorOption | null =>
  product.colorOptions.find((color) => color.name === line?.color) ?? null;

const storageFromCart = (
  product: ProductDetail,
  line: CartItem | undefined,
): StorageOption | null =>
  product.storageOptions.find((storage) => storage.capacity === line?.storage) ?? null;

const resolveSelection = (
  product: ProductDetail,
  items: readonly CartItem[],
  chosen: ProductSelection | null,
): ProductSelection => {
  const lastLine = items.findLast((item) => item.productId === product.id);

  return {
    color: chosen?.color ?? colorFromCart(product, lastLine),
    storage: chosen?.storage ?? storageFromCart(product, lastLine),
  };
};

export const useProductSelection = (product: ProductDetail): UseProductSelectionResult => {
  const { items } = useCart();
  const [chosen, setChosen] = useState<ProductSelection | null>(null);

  const selection = useMemo(
    () => resolveSelection(product, items, chosen),
    [product, items, chosen],
  );

  return {
    selection,
    heroColor: selection.color ?? product.colorOptions[0] ?? null,
    selectColor: (color) => {
      setChosen({ ...selection, color });
    },
    selectStorage: (storage) => {
      setChosen({ ...selection, storage });
    },
  };
};
