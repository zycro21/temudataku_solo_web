import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/affiliator",
          "/checkout",
          "/practice",
          "/payment",
          "/reset-password",
          "/send-email",
          "/shorten-link",
          "/success-reset",
          "/verify"
        ],
      },
    ],
  };
}