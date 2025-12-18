import type { NextConfig } from "next";

// Plain Next.js config without i18n / next-intl integration
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true, // For placeholder images
  },
};

export default nextConfig;
