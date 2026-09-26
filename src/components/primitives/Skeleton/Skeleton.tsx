import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  ariaLabel?: string;
}

export const Skeleton = ({
  width = "100%",
  height = 16,
  radius,
  className,
  ariaLabel,
}: SkeletonProps) => (
  <span
    className={[styles.skeleton, className].filter(Boolean).join(" ")}
    style={{ width, height, borderRadius: radius }}
    role={ariaLabel ? "status" : undefined}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : "true"}
  />
);
