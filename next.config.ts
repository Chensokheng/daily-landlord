import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['172.20.10.4', '192.168.10.19'],

};

export default nextConfig;
