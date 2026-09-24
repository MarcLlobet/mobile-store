import type { NextConfig } from "next";

// The GitHub Pages sub-path only applies to the deployed static export.
// `next dev` runs with NODE_ENV=development, so gating on that keeps local
// dev served at the plain root (http://localhost:3000) instead of 404ing
// every route because the app thinks it lives under /mobile-ecommerce.
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/mobile-ecommerce" : "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
