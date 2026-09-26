"use client";

import { Button } from "@/components/primitives/Button";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n";
import type { ColorOption, StorageOption } from "@/lib/api/types";

import styles from "./AddToCartButton.module.css";

export interface AddToCartButtonProps {
  productId: string;
  name: string;
  brand: string;
  selectedColor: ColorOption | null;
  selectedStorage: StorageOption | null;
}

export const AddToCartButton = ({
  productId,
  name,
  brand,
  selectedColor,
  selectedStorage,
}: AddToCartButtonProps) => {
  const { addItem } = useCart();
  const { t } = useTranslation();
  const canAddToCart = selectedColor !== null && selectedStorage !== null;

  const handleClick = () => {
    if (!selectedColor || !selectedStorage) return;
    addItem({
      productId,
      name,
      brand,
      imageUrl: selectedColor.imageUrl,
      color: selectedColor.name,
      storage: selectedStorage.capacity,
      unitPrice: selectedStorage.price,
    });
  };

  return (
    <div className={styles.wrapper}>
      <Button variant="primary" disabled={!canAddToCart} onClick={handleClick}>
        {t("detail.add_to_cart")}
      </Button>
    </div>
  );
};
