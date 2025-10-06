"use client";

import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

// Helper: cek apakah date masuk minggu berjalan
function isThisWeek(date: Date) {
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Senin
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return localDate >= startOfWeek && localDate <= endOfWeek;
}

export default function MentorStatCards() {
  const [stats, setStats] = useState({
    total: 0,
    totalChange: 0,
    completed: 0,
    completedChange: 0,
    notCompleted: 0,
    notCompletedChange: 0,
    cancelled: 0,
    cancelledChange: 0,
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/mentor/own-mentoring-sessions?page=1&limit=1000`,
          { withCredentials: true }
        );

        const sessions = res.data;

        const completed = sessions.filter((s: any) => s.status === "completed");
        const notCompleted = sessions.filter(
          (s: any) => s.status === "ongoing" || s.status === "scheduled"
        );
        const cancelled = sessions.filter((s: any) => s.status === "cancelled");

        // weekly change pakai createdAt
        const newThisWeek = sessions.filter((s: any) =>
          isThisWeek(new Date(s.createdAt))
        );
        const completedThisWeek = completed.filter((s: any) =>
          isThisWeek(new Date(s.createdAt))
        );
        const notCompletedThisWeek = notCompleted.filter((s: any) =>
          isThisWeek(new Date(s.createdAt))
        );
        const cancelledThisWeek = cancelled.filter((s: any) =>
          isThisWeek(new Date(s.createdAt))
        );

        setStats({
          total: sessions.length,
          totalChange: newThisWeek.length,
          completed: completed.length,
          completedChange: completedThisWeek.length,
          notCompleted: notCompleted.length,
          notCompletedChange: notCompletedThisWeek.length,
          cancelled: cancelled.length,
          cancelledChange: cancelledThisWeek.length,
        });
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, []);

  const statsConfig = [
    {
      title: "Jumlah Sesi",
      value: stats.total,
      change: `+${stats.totalChange} minggu ini`,
      image: "/assets/dashboard/mentor/report.svg",
      color: "text-gray-900",
      showChange: true, // hanya ini yang true
    },
    {
      title: "Sesi Selesai",
      value: stats.completed,
      change: `+${stats.completedChange} minggu ini`,
      image: "/assets/dashboard/mentor/selesai.svg",
      color: "text-green-500",
      showChange: false, // tidak tampil
    },
    {
      title: "Sesi Belum Lengkap",
      value: stats.notCompleted,
      change: `+${stats.notCompletedChange} minggu ini`,
      image: "/assets/dashboard/mentor/belum.svg",
      color: "text-yellow-500",
      showChange: false, // tidak tampil
    },
    {
      title: "Sesi Dibatalkan",
      value: stats.cancelled,
      change: `+${stats.cancelledChange} minggu ini`,
      image: "/assets/dashboard/mentor/batal.svg",
      color: "text-red-500",
      showChange: false, // tidak tampil
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {statsConfig.map((item, idx) => (
        <Card
          key={idx}
          className="max-w-[360px] w-full flex flex-col justify-between px-0 py-2
                     shadow-sm rounded-md"
        >
          {/* Header */}
          <CardHeader className="flex items-center justify-between px-6 pt-2 pb-0">
            <div className="flex items-center gap-2">
              <Image
                src={item.image}
                alt={item.title}
                width={28}
                height={28}
                className="w-5 h-5 object-contain opacity-90 relative top-[-1px]"
              />
              <CardTitle className="text-base font-medium text-gray-500">
                {item.title}
              </CardTitle>
            </div>

            <CardAction className="text-gray-600">
              <ChevronRight className="h-5 w-5" />
            </CardAction>
          </CardHeader>

          {/* Value */}
          <CardContent className="px-6 pt-0 pb-3">
            <div className="flex items-center gap-2">
              <h3 className={`text-3xl font-semibold ${item.color}`}>
                {item.value}
              </h3>
              {item.showChange && (
                <span className="inline-block text-sm font-medium text-emerald-700 bg-green-200 ml-1 px-3 py-1 rounded-full">
                  {item.change}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
