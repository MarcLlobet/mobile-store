import type { JSX, SVGProps } from "react";

export type IconName =
  | "home"
  | "back"
  | "trash"
  | "chevron-left"
  | "chevron-right"
  | "search"
  | "bag-empty"
  | "bag-filled"
  | "close"
  | "logo";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height" | "name"> {
  name: IconName;
  size?: number;
  ariaHidden?: boolean;
  title?: string;
  className?: string;
}

const strokePaths: Partial<Record<IconName, JSX.Element>> = {
  home: (
    <>
      <path d="M3 9.5 12 2l9 7.5" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
  "chevron-left": <path d="M15 18 9 12l6-6" />,
  "chevron-right": <path d="M9 18l6-6-6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </>
  ),
};

const DEFAULT_ICON_SIZE = 24;

interface AssetIcon {
  src: string;
  width: number;
  height: number;
}

const assetIcons: Partial<Record<IconName, AssetIcon>> = {
  back: { src: "/icons/figma/chevron-left.png", width: 80, height: 80 },
  "bag-empty": { src: "/icons/figma/bag-empty.svg", width: 24, height: 24 },
  "bag-filled": { src: "/icons/figma/bag-filled.svg", width: 24, height: 24 },
  close: { src: "/icons/figma/close.svg", width: 80, height: 80 },
  logo: { src: "/icons/figma/logo.svg", width: 77, height: 29 },
};

interface AssetIconProps {
  asset: AssetIcon;
  size: number;
  accessibleName?: string;
  className?: string;
}

const AssetBackedIcon = ({ asset, size, accessibleName, className }: AssetIconProps) => (
  // eslint-disable-next-line @next/next/no-img-element -- tiny decorative/static icon assets, not content images; no next/image benefit
  <img
    src={asset.src}
    alt={accessibleName ?? ""}
    aria-hidden={accessibleName === undefined ? "true" : undefined}
    width={size}
    height={Math.round((asset.height / asset.width) * size)}
    className={className}
  />
);

interface StrokeIconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height" | "name"> {
  name: IconName;
  size: number;
  accessibleName?: string;
}

const StrokeIcon = ({ name, size, accessibleName, className, ...rest }: StrokeIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden={accessibleName === undefined ? "true" : undefined}
    role={accessibleName === undefined ? undefined : "img"}
    {...rest}
  >
    {accessibleName === undefined ? null : <title>{accessibleName}</title>}
    {strokePaths[name]}
  </svg>
);

export const Icon = ({
  name,
  size = DEFAULT_ICON_SIZE,
  ariaHidden = true,
  title,
  className,
  ...rest
}: IconProps) => {
  const asset = assetIcons[name];
  const accessibleName = ariaHidden ? undefined : (title ?? name);

  return asset ? (
    <AssetBackedIcon
      asset={asset}
      size={size}
      accessibleName={accessibleName}
      className={className}
    />
  ) : (
    <StrokeIcon
      name={name}
      size={size}
      accessibleName={accessibleName}
      className={className}
      {...rest}
    />
  );
};
