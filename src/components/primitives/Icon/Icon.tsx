export const ICON_NAMES = ["back", "bag-empty", "bag-filled", "close", "logo"] as const;

export type IconName = (typeof ICON_NAMES)[number];

export interface IconProps {
  name: IconName;
  size?: number;
  ariaHidden?: boolean;
  title?: string;
  className?: string;
}

interface AssetIcon {
  src: string;
  width: number;
  height: number;
}

const assetIcons: Record<IconName, AssetIcon> = {
  back: { src: "/icons/figma/chevron-left.png", width: 80, height: 80 },
  "bag-empty": { src: "/icons/figma/bag-empty.svg", width: 24, height: 24 },
  "bag-filled": { src: "/icons/figma/bag-filled.svg", width: 24, height: 24 },
  close: { src: "/icons/figma/close.svg", width: 80, height: 80 },
  logo: { src: "/icons/figma/logo.svg", width: 77, height: 29 },
};

const DEFAULT_ICON_SIZE = 24;

export const Icon = ({
  name,
  size = DEFAULT_ICON_SIZE,
  ariaHidden = true,
  title,
  className,
}: IconProps) => {
  const asset = assetIcons[name];
  const accessibleName = ariaHidden ? undefined : (title ?? name);

  return (
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
};
