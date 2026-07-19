import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // transpilePackages: ["@gig-hub/types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
