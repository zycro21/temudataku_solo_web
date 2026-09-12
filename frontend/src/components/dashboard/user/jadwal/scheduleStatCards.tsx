"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ScheduleStatCards() {
  const [programCount, setProgramCount] = useState<number | null>(null);
  const [completedProgramCount, setCompletedProgramCount] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        // ambil jumlah program terdaftar
        const [registeredRes, completedRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings`,
            {
              params: { page: 1, limit: 1000, status: "confirmed" },
              withCredentials: true,
            },
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/completed-programs`,
            {
              params: { page: 1, limit: 1000 },
              withCredentials: true,
            },
          ),
        ]);

        const totalRegistered =
          registeredRes.data?.data?.pagination?.total ?? 0;
        const totalCompleted = completedRes.data?.data?.pagination?.total ?? 0;

        setProgramCount(totalRegistered);
        setCompletedProgramCount(totalCompleted);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat data program.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgramData();
  }, []);

  const stats = [
    {
      title: "Program Terdaftar",
      value: programCount ?? 0,
      icon: "/assets/dashboard/user/programterdaftar.svg",
    },
    {
      title: "Program Selesai",
      value: completedProgramCount ?? 0,
      icon: "/assets/dashboard/user/programterdaftar.svg",
    },
  ];

  return (
    // 🔥 DIUBAH: dulu "grid-cols-1 sm:grid-cols-2" (1 kolom di HP sempit).
    // Sekarang "grid-cols-2" dari awal (konsisten sama StatCards di
    // Overview) + gap lebih rapat di mobile. Mulai sm: ke atas balik
    // PERSIS "gap-4" seperti semula.
    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 justify-items-start min-w-0">
      {stats.map((item, idx) => (
        <div
          key={idx}
          // 🔥 DIUBAH: "max-w-[220px]" dulu berlaku di semua ukuran —
          // sekarang "max-w-none sm:max-w-[220px]" supaya di mobile card
          // mengisi penuh kolom grid-nya (nggak nyisain ruang kosong di
          // layout 2-kolom sempit), balik PERSIS max-w-[220px] mulai sm:
          // ke atas. Padding juga sedikit dirapatkan di mobile (p-2.5).
          className="relative p-2.5 sm:p-3 bg-white border border-gray-200 rounded-lg shadow-sm max-w-none sm:max-w-[220px] w-full"
        >
          <ChevronRight className="absolute top-2 right-2 w-3 h-3 text-gray-700" />

          {/* Icon + Title */}
          <div className="flex items-center gap-1.5">
            <Image src={item.icon} alt={item.title} width={14} height={14} />
            <span className="text-[11px] sm:text-[12px] text-gray-600 leading-tight">
              {item.title}
            </span>
          </div>

          {/* Value */}
          <div className="mt-2 sm:mt-3 h-7 flex items-center">
            {loading ? (
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {item.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
