"use client";

import { useLinkStatus } from "next/link";

import styles from "./TilePendingHint.module.css";

export const TilePendingHint = () => {
  const { pending } = useLinkStatus();

  return pending ? <span aria-hidden="true" className={styles.hint} /> : null;
};
