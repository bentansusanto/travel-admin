import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone only for PM2 / Docker, not when deployed to Vercel
  output: process.env.VERCEL ? undefined : "standalone",
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
