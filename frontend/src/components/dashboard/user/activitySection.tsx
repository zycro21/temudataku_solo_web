"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Activity = {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  status: string;
  paymentId?: string;
};

export default function ActivitySection() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const res = await axios.get(
          `${baseUrl}/api/ayclbooking/mentee/incomplete`,
          { withCredentials: true },
        );

        const mapped = (res.data?.data || []).map((b: any) => ({
          id: b.id,
          type: "AYCL_FORM",
          title: b.batch?.title || "All You Can Learn",
          createdAt: b.createdAt,
          status: "Lengkapi Data AYCL",
          paymentId: b.payment?.id,
        }));

        // SORT (biar konsisten)
        const sorted = mapped.sort(
          (a: Activity, b: Activity) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setActivities(sorted.slice(0, 3));
      } catch (err) {
        console.error("Gagal mengambil aktivitas:", err);
        setActivities([]);
      }
    };

    fetchActivities();
  }, []);

  const handleView = (activity: Activity) => {
    if (activity.type === "AYCL_FORM") {
      router.push(`/aycl/complete/${activity.id}/${activity.paymentId}`);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm w-full overflow-hidden">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-800">
          Aktivitas Terkini
        </h2>
      </div>

      <div className="space-y-3 h-[180px] max-h-[180px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-[12px] text-center">
            Tidak ada aktivitas saat ini.
          </p>
        ) : (
          activities.map((item, index) => (
            // 🔥 DIUBAH: dulu selalu "flex items-center justify-between"
            // (title+status kiri, tombol kanan, sejajar dalam 1 baris). Di
            // mobile sekarang di-stack (flex-col items-start) — status
            // ditampilkan sebagai pill/badge (bukan teks polos), tombol
            // full-width di bawah biar gampang di-tap. Mulai sm: ke atas
            // balik PERSIS layout original (flex-row, status teks polos,
            // tombol ukuran asli).
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-0 p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {item.title}
                </span>

                {/* 🔥 DIUBAH: versi mobile pakai pill badge, versi sm: ke
                    atas pakai teks polos original — dua elemen terpisah,
                    ditoggle lewat sm:hidden / hidden sm:inline. */}
                <span className="sm:hidden mt-1 inline-flex w-fit items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-600">
                  {item.status}
                </span>
                <span className="hidden sm:inline text-[12px] text-orange-500 mt-0.5 font-medium">
                  {item.status}
                </span>
              </div>

              <button
                onClick={() => handleView(item)}
                className="w-full sm:w-auto bg-emerald-500 text-white text-[12px] px-3 py-1.5 sm:py-1 rounded-full hover:bg-emerald-600 transition"
              >
                Lengkapi
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
