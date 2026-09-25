"use client";

import { useCart } from "@/context/CartContext";
import { normalizeImageUrl } from "@/lib/api/transform";
import type { ColorOption, StorageOption } from "@/lib/api/types";
import { Button } from "@/components/primitives/Button";
import styles from "./AddToCartButton.module.css";

/**
 * Gated "Add to cart" control — disabled until both a color and a storage
 * capacity are selected. On click, calls the frozen `useCart().addItem`
 * contract with `unitPrice: selectedStorage.price` (the absolute price for
 * that tier, per the confirmed API quirk) and the normalized image of the
 * currently selected color (so the cart line shows exactly what the user
 * saw on the hero image).
 */
export interface AddToCartButtonProps {
  productId: string;
  name: string;
  brand: string;
  selectedColor: ColorOption | null;
  selectedStorage: StorageOption | null;
}

export function AddToCartButton({
  productId,
  name,
  brand,
  selectedColor,
  selectedStorage,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const canAddToCart = selectedColor !== null && selectedStorage !== null;

  const handleClick = () => {
    if (!selectedColor || !selectedStorage) return;
    addItem({
      productId,
      name,
      brand,
      imageUrl: normalizeImageUrl(selectedColor.imageUrl),
      color: selectedColor.name,
      storage: selectedStorage.capacity,
      unitPrice: selectedStorage.price,
    });
  };

  return (
    <div className={styles.wrapper}>
      <Button variant="primary" disabled={!canAddToCart} onClick={handleClick}>
        Añadir
      </Button>
    </div>
  );
}
