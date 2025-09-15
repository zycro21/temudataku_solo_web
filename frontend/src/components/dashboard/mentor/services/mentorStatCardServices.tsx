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
      change: "+3 minggu ini",
      image: "/assets/dashboard/mentor/report.svg",
      link: "/dashboard/mentor/schedule",
    },
    {
      title: "Sudah Ditinjau",
      value: 34,
      change: "+22 minggu ini",
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/services",
    },
    {
      title: "Belum Ditinjau",
      value: 32,
      change: "+3 minggu ini",
      image: "/assets/dashboard/mentor/laporan.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Perlu Revisi",
      value: 234,
      change: "+10 minggu ini",
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/feedback",
    },
  ];

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
              <h3 className="text-3xl font-semibold text-gray-900">
                {item.value}
              </h3>
              <span className="inline-block text-sm font-medium text-emerald-700 bg-green-200 px-3 py-1 rounded-full">
                {item.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
