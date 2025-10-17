"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function ClientTracker() {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

  // Simpan activityId per halaman
  const [activityMap, setActivityMap] = useState<Record<string, string>>({});
  // Simpan waktu mulai per halaman
  const startTimeMap = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!baseUrl || !currentUser) return;

    const page = pathname;

    // Mulai timer untuk halaman ini jika belum ada
    if (!startTimeMap.current[page]) {
      startTimeMap.current[page] = Date.now();
    }

    // Buat atau ambil activity log
    const createOrGetActivity = async () => {
      if (!activityMap[page]) {
        try {
          const res = await axios.post(
            `${baseUrl}/api/logActivity/activity`,
            { page, durationSec: 0 },
            { withCredentials: true }
          );
          setActivityMap((prev) => ({ ...prev, [page]: res.data.data.id }));
        } catch (err) {
          console.error("Failed to create activity log:", err);
        }
      }
    };

    createOrGetActivity();

    // Update durasi tiap 30 detik
    const interval = setInterval(() => {
      const id = activityMap[page];
      if (!id) return;

      const duration = Math.floor(
        (Date.now() - startTimeMap.current[page]) / 1000
      );

      axios
        .put(
          `${baseUrl}/api/logActivity/activity/${id}`,
          { page, durationSec: duration },
          { withCredentials: true }
        )
        .catch((err) => console.error("Failed to update activity log:", err));
    }, 30000);

    return () => clearInterval(interval);
  }, [pathname, baseUrl, currentUser, activityMap]);

  return null;
}
