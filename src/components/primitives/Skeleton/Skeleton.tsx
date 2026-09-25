import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  readonly width?: number | string;
  readonly height?: number | string;
  readonly radius?: number | string;
  readonly className?: string;
  readonly ariaLabel?: string;
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
