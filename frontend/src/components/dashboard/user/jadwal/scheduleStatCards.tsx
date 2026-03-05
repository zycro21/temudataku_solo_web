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
      title: "Program Telah Dilakukan",
      value: completedProgramCount ?? 0,
      icon: "/assets/dashboard/user/programterdaftar.svg",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 justify-items-start">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="relative p-4 bg-white border border-gray-200 rounded-lg shadow-sm max-w-[240px] w-full"
        >
          <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-gray-800" />

          {/* Icon + Title */}
          <div className="flex items-center gap-2">
            <Image
              src={item.icon}
              alt={item.title}
              width={16}
              height={16}
              className="text-gray-600"
            />
            <span className="text-md text-gray-600">{item.title}</span>
          </div>

          {/* Value */}
          <div className="mt-5 h-9 flex items-center">
            {loading ? (
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {item.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
