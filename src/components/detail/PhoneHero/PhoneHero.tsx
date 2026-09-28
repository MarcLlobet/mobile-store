"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";

import { sharedImageName } from "@/lib/view-transitions";

import styles from "./PhoneHero.module.css";

export interface PhoneHeroVariant {
  key: string;
  imageUrl: string;
}

export interface PhoneHeroProps {
  variants: readonly PhoneHeroVariant[];
  activeKey: string;
  name: string;
  productId: string;
}

export const PhoneHero = ({ variants, activeKey, name, productId }: PhoneHeroProps) => {
  const stackRef = useRef<HTMLDivElement>(null);
  const variantKeys = variants.map((variant) => variant.key).join("\u0000");

  useEffect(() => {
    const images = stackRef.current?.querySelectorAll("img") ?? [];
    void Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      [...images].map((image) => image.decode?.()),
    );
  }, [variantKeys]);

  if (variants.length === 0) {
    return null;
  }

  const activeIndex = variants.findIndex((variant) => variant.key === activeKey);
  const activeVariantIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.stack}
        ref={stackRef}
        style={{ viewTransitionName: sharedImageName(productId) }}
      >
        {variants.map((variant, index) => {
          const isActive = index === activeVariantIndex;
          return (
            <Image
              key={variant.key}
              src={variant.imageUrl}
              data-variant-index={index}
              alt={isActive ? name : ""}
              aria-hidden={!isActive}
              width={510}
              height={630}
              className={`${styles.image} ${isActive ? styles.active : ""}`}
              sizes="(max-width: 768px) 100vw, 510px"
              loading="eager"
              fetchPriority={isActive ? "high" : "low"}
            />
          );
        })}
      </div>
    </div>
  );
};
