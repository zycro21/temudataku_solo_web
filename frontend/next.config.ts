import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// parse API base url kalau ada, bungkus di try/catch
const extraRemotePatterns = (() => {
  if (!apiBaseUrl) return [];
  try {
    const url = new URL(apiBaseUrl);
    return [
      {
        protocol: url.protocol.replace(":", ""), // "http" atau "https"
        hostname: url.hostname, // misal: "localhost" atau "api.example.com"
        port: url.port || "", // misal: "5001" atau ""
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
    // ini akan mengabaikan semua lint error saat build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      ...(extraRemotePatterns as any),
    ],
  },
};

export default nextConfig;
