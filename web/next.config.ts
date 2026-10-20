import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Backend-Code aus ../src (Renderer, Pingen-Adapter, Preise) mitbundeln
  outputFileTracingRoot: path.join(__dirname, ".."),
  experimental: { externalDir: true },
  serverExternalPackages: ["pdf-lib"],
  // ../src nutzt NodeNext-Importe mit .js-Endung auf .ts-Dateien → auflösen
  turbopack: { resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"] },
  webpack: (config) => {
    config.resolve.extensionAlias = { ".js": [".ts", ".js"] };
    return config;
  },
};
export default nextConfig;
