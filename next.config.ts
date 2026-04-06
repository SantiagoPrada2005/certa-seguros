/// <reference types="next" />
// @ts-ignore - Silence IDE false positive for Next.js 16 types in root config
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['[IP_ADDRESS]'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "me7aitdbxq.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
