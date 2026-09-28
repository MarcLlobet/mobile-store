import type { ReactNode } from "react";

import { BackButton } from "@/components/detail/BackButton";
import { Page } from "@/components/layout/Page";

import styles from "./layout.module.css";

const PhoneDetailLayout = ({ children }: { children: ReactNode }) => (
  <Page width="column" className={styles.detail} lead={<BackButton />}>
    {children}
  </Page>
);

export default PhoneDetailLayout;
