import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan HP Anda (192.168.1.10) untuk memuat script dari server lokal
  allowedDevOrigins: ["192.168.1.10"],
};

export default nextConfig;