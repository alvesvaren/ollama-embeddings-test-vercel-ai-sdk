import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    }
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
