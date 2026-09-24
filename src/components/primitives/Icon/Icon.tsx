import type { JSX, SVGProps } from "react";

/**
 * Minimal outline icon set (simple, MIT-style Feather-icon-shaped paths).
 *
 * NOTE: exact Figma icon glyphs could not be pulled for this set — the
 * Figma REST API rate-limited this session (429, ~4.6 day retry window)
 * right after the design-token pull. These are deliberately plain,
 * recognizable outline icons so the app is usable and accessible now;
 * swap the `<svg>` contents per `name` for the pixel-accurate Figma
 * exports in Phase 2 once Figma access is available again — the `Icon`
 * component's public API (`name`/`size`/`ariaHidden`) does not need to
 * change to do that.
 */
export type IconName =
  "home" | "cart" | "back" | "trash" | "chevron-left" | "chevron-right" | "search";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height" | "name"> {
  name: IconName;
  size?: number;
  ariaHidden?: boolean;
  title?: string;
}

const paths: Record<IconName, JSX.Element> = {
  home: (
    <>
      <path d="M3 9.5 12 2l9 7.5" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </>
  ),
  cart: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  back: (
    <>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
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

export function Icon({ name, size = 24, ariaHidden = true, title, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden ? "true" : undefined}
      role={ariaHidden ? undefined : "img"}
      {...rest}
    >
      {!ariaHidden && title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
