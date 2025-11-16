import type { NextConfig } from "next";

// next.config.ts

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false, // keep strict unless you really need true
  },
};

export default nextConfig;
