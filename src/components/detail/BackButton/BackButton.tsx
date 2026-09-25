import Link from "next/link";

import { Icon } from "@/components/primitives/Icon";

import styles from "./BackButton.module.css";

export interface BackButtonProps {
  readonly href?: string;
}

export const BackButton = ({ href = "/" }: BackButtonProps) => (
  <Link href={href} className={styles.link} aria-label="Back to listing">
    <Icon name="back" ariaHidden />
    <span>Back</span>
  </Link>
);
