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

// Helper untuk cek apakah tanggal ada di minggu ini
function isThisWeek(date: Date) {
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return localDate >= startOfWeek && localDate <= endOfWeek;
}

export default function MentorStatCards() {
  const [statsData, setStatsData] = useState({
    total: 0,
    complete: 0,
    incomplete: 0,
    notFilled: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportStats = async () => {
      try {
        setLoading(true);

        // Ambil semua laporan mentor
        const reportRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentor/reports?page=1&limit=1000`,
          { withCredentials: true }
        );
        const reports = reportRes.data.data || [];

        // 2️⃣ Ambil semua sesi mentor
        const sessionRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/mentor/own-mentoring-sessions`,
          { withCredentials: true }
        );

        const sessions = Array.isArray(sessionRes.data)
          ? sessionRes.data
          : sessionRes.data.data || [];

        // 3️⃣ Filter laporan selesai dan belum lengkap
        const completeReports = reports.filter(
          (r: any) =>
            r.understanding &&
            r.participation &&
            r.challenges &&
            r.commonQuestions &&
            r.nextFocus &&
            r.additionalNotes
        );

        const incompleteReports = reports.filter(
          (r: any) =>
            !r.understanding ||
            !r.participation ||
            !r.challenges ||
            !r.commonQuestions ||
            !r.nextFocus ||
            !r.additionalNotes
        );

        // 4️⃣ Cek sesi yang belum ada laporan
        const reportedSessionIds = reports.map((r: any) => r.sessionId);
        const notReportedSessions = sessions.filter(
          (s: any) => !reportedSessionIds.includes(s.id)
        );

        // 5️⃣ Hitung laporan minggu ini
        const newThisWeek = reports.filter((r: any) =>
          isThisWeek(new Date(r.createdAt))
        );

        // 6️⃣ Update state
        setStatsData({
          total: reports.length,
          complete: completeReports.length,
          incomplete: incompleteReports.length,
          notFilled: notReportedSessions.length,
          thisWeek: newThisWeek.length,
        });
      } catch (error) {
        console.error("Error fetching mentor report stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportStats();
  }, []);

  const stats = [
    {
      title: "Jumlah Report",
      value: statsData.total,
      change: `+${statsData.thisWeek} Minggu Ini`,
      image: "/assets/dashboard/mentor/laporan.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Report Selesai",
      value: statsData.complete,
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Report Belum Lengkap",
      value: statsData.incomplete,
      image: "/assets/dashboard/mentor/laporan.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Report Belum Diisi",
      value: statsData.notFilled,
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/report",
    },
  ];

  const getValueClass = (title: string) => {
    if (title === "Report Selesai") return "text-green-500";
    if (title === "Report Belum Lengkap") return "text-yellow-500";
    if (title === "Report Belum Diisi") return "text-red-500";
    return "text-gray-900";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {loading
        ? // ⏳ Skeleton Loading State
          Array(4)
            .fill(0)
            .map((_, idx) => (
              <Card
                key={idx}
                className="max-w-[360px] w-full flex flex-col justify-between px-0 py-2 shadow-sm rounded-md animate-pulse"
              >
                <CardHeader className="flex items-center justify-between px-6 pt-2 pb-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                </CardHeader>

                <CardContent className="px-6 pt-0 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-12 bg-gray-200 rounded" />
                    <div className="h-5 w-24 bg-gray-200 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
        : // ✅ Data Loaded
          stats.map((item, idx) => (
            <Card
              key={idx}
              className="max-w-[360px] w-full flex flex-col justify-between px-0 py-2 shadow-sm rounded-md"
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
                  <h3
                    className={`text-3xl font-semibold ${getValueClass(
                      item.title
                    )}`}
                  >
                    {item.value}
                  </h3>

                  {item.title === "Jumlah Report" && item.change && (
                    <span className="inline-block text-sm font-medium text-emerald-700 bg-green-200 px-3 py-1 rounded-full">
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
