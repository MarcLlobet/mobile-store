"use client";

import { useQuery } from "@tanstack/react-query";

import { PhoneDetailView } from "@/components/detail/PhoneDetailView";
import { productQuery } from "@/lib/api/queries";

import styles from "./PhoneDetail.module.css";

export interface PhoneDetailProps {
  readonly id: string;
}

export const PhoneDetail = ({ id }: PhoneDetailProps) => {
  const { data: product, isPending, isError } = useQuery(productQuery(id));

  if (isPending) {
    return null;
  }

  if (isError) {
    return (
      <p role="alert" className={styles.message}>
        Something went wrong loading this phone. Please try again.
      </p>
    );
  }

  if (!product) {
    return (
      <p role="alert" className={styles.message}>
        This phone is no longer available.
      </p>
    );
  }

  return <PhoneDetailView product={product} />;
};
