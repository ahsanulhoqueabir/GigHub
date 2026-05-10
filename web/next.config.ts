import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.5"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "file.briefly60.online",
      },
    ],
  },
};

export default nextConfig;
