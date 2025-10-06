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
  const [reportCount, setReportCount] = useState<number>(0);
  const [reportChange, setReportChange] = useState<number>(0);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentor/reports?page=1&limit=1000`,
          { withCredentials: true }
        );

        const { data, pagination } = res.data;
        setReportCount(pagination?.total || 0);

        const newThisWeek = data.filter((r: any) =>
          isThisWeek(new Date(r.createdAt))
        );
        setReportChange(newThisWeek.length);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  const stats = [
    {
      title: "Jumlah Report",
      value: reportCount,
      change: `+${reportChange} Minggu Ini`,
      image: "/assets/dashboard/mentor/laporan.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Report Selesai",
      value: 34,
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/services",
    },
    {
      title: "Report Belum Lengkap",
      value: 32,
      image: "/assets/dashboard/mentor/laporan.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Report Belum Diisi",
      value: 234,
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/feedback",
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
      {stats.map((item, idx) => (
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
