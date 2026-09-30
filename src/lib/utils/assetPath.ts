const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const STORYBOOK_ASSET_BASE_PATH = process.env.STORYBOOK_ASSET_BASE_PATH;

export const assetPath = (path: string): string => {
  const basePath = STORYBOOK_ASSET_BASE_PATH ?? BASE_PATH;
  const relativePath = basePath.endsWith("/") ? path.replace(/^\//, "") : path;

  return `${basePath}${relativePath}`;
};
