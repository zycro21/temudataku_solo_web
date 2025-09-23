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
    // kalau env salah format, jangan crash — hanya log
    // contoh: NEXT_PUBLIC_API_BASE_URL tanpa protocol akan gagal
    // gunakan format lengkap: http://localhost:5001 atau https://api.domain.com
    // eslint-disable-next-line no-console
    console.warn("Invalid NEXT_PUBLIC_API_BASE_URL:", apiBaseUrl, err);
    return [];
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // pattern default (misal Unsplash)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      // spread extra patterns dari env (cast ke any agar TS tidak protes)
      ...(extraRemotePatterns as any),
    ],
  },
};

export default nextConfig;
