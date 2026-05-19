import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pdfjs-dist', 'officeparser', 'pdf-parse'],
};

export default nextConfig;
