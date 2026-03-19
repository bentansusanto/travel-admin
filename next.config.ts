import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // For PM2 deployment
   devIndicators: false,
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
