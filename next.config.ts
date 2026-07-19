import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
 
allowedDevOrigins: ["192.168.1.15", "192.168.1.15:3000", "http://192.168.1.15:3000"],
};

export default nextConfig;