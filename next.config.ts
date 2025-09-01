import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during build for production deployments
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript checking during build for production deployments
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
