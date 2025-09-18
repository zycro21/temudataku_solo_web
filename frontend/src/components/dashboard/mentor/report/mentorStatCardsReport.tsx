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

export default function MentorStatCards() {
  const stats = [
    {
      title: "Jumlah Proyek",
      value: 32,
      change: "dari 134 Peserta",
      image: "/assets/dashboard/mentor/report.svg",
      link: "/dashboard/mentor/schedule",
    },
    {
      title: "Sudah Ditinjau",
      value: 34,
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/services",
    },
    {
      title: "Belum Ditinjau",
      value: 32,
      image: "/assets/dashboard/mentor/laporan.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Perlu Revisi",
      value: 234,
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/feedback",
    },
  ];

  // fungsi untuk menentukan warna value
  const getValueClass = (title: string) => {
    if (title === "Sudah Ditinjau") return "text-green-500";
    if (title === "Belum Ditinjau") return "text-yellow-500";
    if (title === "Perlu Revisi") return "text-red-500";
    return "text-gray-900"; // default
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

              {/* tampilkan change hanya untuk Jumlah Proyek */}
              {item.title === "Jumlah Proyek" && item.change && (
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
