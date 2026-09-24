import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/mobile-ecommerce",
  assetPrefix: "/mobile-ecommerce",
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
