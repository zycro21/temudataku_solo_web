"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  Users,
  UserCheck,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./jadwal-sesi/data-table";
import { columns, SesiMentoring } from "./jadwal-sesi/columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const [mentees] = useState<SesiMentoring[]>([
    {
      id: "MNTG01",
      mentor: "Gilang Dirga",
      program: "Short Class",
      topik: "Excel Untuk Pemula",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-26",
      time: "20:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG02",
      mentor: "Gilang Dirga",
      program: "Live Class",
      topik: "Introduction to Data Science",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-26",
      time: "19:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG03",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topik: "Belajar Data Science dari Nol",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-26",
      time: "18:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG04",
      mentor: "Nina Pratiwi",
      program: "1 on 1 Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      ukuranFile: 2.1 * 1024 * 1024,
      status: "terjadwal",
      date: "20-10-26",
      time: "16:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG05",
      mentor: "Laura Ayu",
      program: "Group Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      ukuranFile: 1.8 * 1024 * 1024,
      status: "terjadwal",
      date: "20-10-26",
      time: "15:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG06",
      mentor: "Gilang Dirga",
      program: "Group Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      ukuranFile: 2.2 * 1024 * 1024,
      status: "terjadwal",
      date: "20-10-26",
      time: "14:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG07",
      mentor: "Laura Ayu",
      program: "Group Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      ukuranFile: 2.0 * 1024 * 1024,
      status: "terjadwal",
      date: "20-10-26",
      time: "20:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG08",
      mentor: "Laura Ayu",
      program: "Group Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      ukuranFile: 2.3 * 1024 * 1024,
      status: "terjadwal",
      date: "20-10-26",
      time: "19:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG09",
      mentor: "Laura Ayu",
      program: "Short Class",
      topik: "Excel Untuk Pemula",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-26",
      time: "18:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG10",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      topik: "Excel Untuk Pemula",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-26",
      time: "16:00",
      durasi: "2 jam",
    },

    // ➕ Tambahan data baru
    {
      id: "MNTG11",
      mentor: "Gilang Dirga",
      program: "Live Class",
      topik: "Data Cleaning dengan Python",
      dokumenPendukung: "Dataset.csv",
      ukuranFile: 0.55 * 1024 * 1024,
      status: "terjadwal",
      date: "20-10-27",
      time: "20:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG12",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topik: "Machine Learning Dasar",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-27",
      time: "19:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG13",
      mentor: "Laura Ayu",
      program: "1 on 1 Mentoring",
      topik: "Analisis Data untuk Business Insight",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-27",
      time: "18:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG14",
      mentor: "Gilang Dirga",
      program: "Short Class",
      topik: "SQL Query Fundamental",
      dokumenPendukung: "Materi_SQL.pdf",
      ukuranFile: 1.85 * 1024 * 1024,
      status: "terjadwal",
      date: "20-10-28",
      time: "16:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG15",
      mentor: "Nina Pratiwi",
      program: "Group Mentoring",
      topik: "Data Visualization Storytelling",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-28",
      time: "15:00",
      durasi: "2 jam",
    },
    {
      id: "MNTG16",
      mentor: "Laura Ayu",
      program: "Live Class",
      topik: "Excel Advanced (Pivot, Lookup, Macro)",
      dokumenPendukung: "-",
      ukuranFile: 0,
      status: "terjadwal",
      date: "20-10-28",
      time: "14:00",
      durasi: "2 jam",
    },
  ]);

  const stats = [
    {
      title: "Mentoring Terdaftar",
      value: "390",
      change: "+3 minggu ini",
      image: "/assets/admin/mentorterdaftar.svg", // tambahkan
      color: "",
    },
    {
      title: "Terjadwal",
      value: "376",
      image: "/assets/dashboard/user/jadwal.svg",
      color: "text-blue-600",
    },
    {
      title: "Penjadwalan Ulang",
      value: "14",
      image: "/assets/admin/penjadwalanulang.svg",
      color: "text-orange-600",
    },
    {
      title: "Dibatalkan",
      value: "14",
      image: "/assets/admin/menteenonac.svg",
      color: "text-red-600",
    },
    {
      title: "Selesai",
      value: "14",
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Jadwal Sesi
          </h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Jadwal Sesi</span>
          </p>
        </div>

        {/* Dropdown Export Data */}
        <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>

              {/* Chevron Toggle */}
              {exportOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => console.log("Export CSV")}>
              Export ke CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Export Excel")}>
              Export ke Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards — versi full width */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="max-w-[340px] w-full flex flex-col justify-between px-0 py-2
      shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
      cursor-pointer rounded-lg bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-3">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={15}
                  height={15}
                  className="opacity-90"
                />

                <p className="text-md font-medium text-gray-600">
                  {stat.title}
                </p>
              </div>

              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>

            {/* Content */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p
                  className={`text-4xl font-bold leading-tight ${
                    stat.color || "text-gray-900"
                  }`}
                >
                  {stat.value}
                </p>

                {stat.change && (
                  <span className="inline-block text-xs font-medium text-emerald-700 bg-green-200 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Jadwal Sesi Mentoring
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={mentees} />
      </Card>
    </>
  );
}
