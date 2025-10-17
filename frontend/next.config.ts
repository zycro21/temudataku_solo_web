import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Parse API base URL kalau ada
const extraRemotePatterns = (() => {
  if (!apiBaseUrl) return [];
  try {
    const url = new URL(apiBaseUrl);
    return [
      {
        protocol: url.protocol.replace(":", ""), // "http" atau "https"
        hostname: url.hostname, // contoh: "api.temudataku.com" atau "temudataku.com"
        port: url.port || "",
        pathname: "/**",
      },
    ];
  } catch (err) {
    console.warn("Invalid NEXT_PUBLIC_API_BASE_URL:", apiBaseUrl, err);
    return [];
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // biar build lancar
  },
  images: {
    remotePatterns: [
      // Untuk Unsplash (kalau masih dipakai)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      // Untuk lokal development
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/images/**",
      },
      // Untuk production (temudataku.com)
      {
        protocol: "https",
        hostname: "temudataku.com",
        port: "",
        pathname: "/images/**",
      },
      ...(extraRemotePatterns as any),
    ],
  },
};

export default nextConfig;