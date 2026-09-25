import type { ReactNode } from "react";

import { BackButton } from "@/components/detail/BackButton";

import styles from "./layout.module.css";

const PhoneDetailLayout = ({ children }: { children: ReactNode }) => (
  <main>
    <div className={styles.backRow}>
      <BackButton />
    </div>
    <div className={styles.page}>{children}</div>
  </main>
);

export default PhoneDetailLayout;
