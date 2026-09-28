"use client";

import { useEffect, useId, useState } from "react";

import styles from "./BagIcon.module.css";

export interface BagIconProps {
  filled: boolean;
  size?: number;
  className?: string;
}

const DEFAULT_SIZE = 24;

const OUTLINE_PATH =
  "M14.4706 4.32031H9.76471V8.08502H6V20.3203H18.2353V8.08502H14.4706V4.32031ZM13.5294 9.0262V11.3791H14.4706V9.0262H17.2941V19.3791H6.94118V9.0262H9.76471V11.3791H10.7059V9.0262H13.5294ZM13.5294 8.08502V5.26149H10.7059V8.08502H13.5294Z";

const SOLID_PATH =
  "M14.4706 4H9.76471V7.76471H6V20H18.2353V7.76471H14.4706V4ZM13.5294 7.76471V11.0588H14.4706V7.76471H13.5294ZM10.7059 7.76471V11.0588H9.76471V7.76471H10.7059ZM10.7059 7.76471H13.5294V4.94118H10.7059V7.76471Z";

const OUTLINE_OFFSET = "translate(0, -0.32031)";

export const BagIcon = ({ filled, size = DEFAULT_SIZE, className }: BagIconProps) => {
  const rawId = useId();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setAnimate(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const uid = rawId.replaceAll(/[^\w-]/gu, "");
  const aboveId = `bag-above-${uid}`;
  const belowId = `bag-below-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
      data-filled={filled ? "true" : "false"}
      data-animate={animate ? "true" : "false"}
    >
      <defs>
        <mask id={aboveId}>
          <rect className={styles.wipe} x="0" y="-7" width="24" height="27" fill="#fff" />
        </mask>
        <mask id={belowId}>
          <rect className={styles.wipe} x="0" y="20" width="24" height="27" fill="#fff" />
        </mask>
      </defs>
      <g mask={`url(#${aboveId})`}>
        <path
          transform={OUTLINE_OFFSET}
          fillRule="evenodd"
          clipRule="evenodd"
          fill="currentColor"
          d={OUTLINE_PATH}
        />
      </g>
      <g mask={`url(#${belowId})`}>
        <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d={SOLID_PATH} />
      </g>
    </svg>
  );
};
