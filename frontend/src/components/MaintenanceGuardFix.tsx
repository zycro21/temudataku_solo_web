"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function MaintenanceGuard() {
  const pathname = usePathname();
  const router = useRouter();

  const maintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // route yang diizinkan
  const excluded = [
    "/shorten-link",
    "/affiliator",
    "/dashboard/affiliator",
    "/maintenance",
  ];

  useEffect(() => {
    if (!maintenance) return;

    // jika route termasuk pengecualian → lewati
    const allowed = excluded.some((p) => pathname.startsWith(p));
    if (allowed) return;

    // jika masuk maintenance → redirect
    if (pathname !== "/maintenance") {
      router.replace("/maintenance");
    }
  }, [pathname, router, maintenance]);

  return null;
}
