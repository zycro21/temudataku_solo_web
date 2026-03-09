import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const extraRemotePatterns = (() => {
  if (!apiBaseUrl) return [];
  try {
    const url = new URL(apiBaseUrl);
    return [
      {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "temudataku.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      ...(extraRemotePatterns as any),
    ],
  },
};

export default nextConfig;
