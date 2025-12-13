"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DataTable } from "./data-table";
import { columns, Datas } from "./columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const [datas] = useState<Datas[]>([
    {
      id: "MNTG01",
      mentor: "Gilang Dirga",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kepuasan: 0,
        keaktifan: 0,
        perkembangan: 0,
        kendala: "",
        tantangan: "",
        catatan_mentor: "",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG02",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Introduction to Data Science",
      evaluasi: {
        kepuasan: 0,
        keaktifan: 0,
        perkembangan: 0,
        kendala: "",
        tantangan: "",
        catatan_mentor: "",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG03",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Belajar Data Science dari Nol",
      evaluasi: {
        kepuasan: 0,
        keaktifan: 0,
        perkembangan: 0,
        kendala: "",
        tantangan: "",
        catatan_mentor: "",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG04",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kepuasan: 0,
        keaktifan: 0,
        perkembangan: 0,
        kendala: "",
        tantangan: "",
        catatan_mentor: "",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG05",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kepuasan: 85,
        keaktifan: 80,
        perkembangan: 88,
        kendala: "Kesulitan memahami dataset besar",
        tantangan: "Optimasi model prediksi",
        catatan_mentor: "Sudah cukup baik, perlu latihan lebih banyak",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG06",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kepuasan: 92,
        keaktifan: 90,
        perkembangan: 91,
        kendala: "Kurang waktu latihan",
        tantangan: "Pemahaman visualisasi lanjutan",
        catatan_mentor: "Bagus, tinggal konsisten",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG07",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kepuasan: 88,
        keaktifan: 85,
        perkembangan: 87,
        kendala: "",
        tantangan: "Perlu perbaikan dalam dokumentasi kode",
        catatan_mentor: "Sangat aktif",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG08",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kepuasan: 90,
        keaktifan: 92,
        perkembangan: 89,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Sangat baik, siap lanjut ke level berikutnya",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG09",
      mentor: "Laura Ayu",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kepuasan: 99,
        keaktifan: 98,
        perkembangan: 97,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Luar biasa, hasil sempurna",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG10",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kepuasan: 0,
        keaktifan: 0,
        perkembangan: 0,
        kendala: "",
        tantangan: "",
        catatan_mentor: "",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG11",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      date: "11-05-2025, 19:00",
      topic: "Python Dasar untuk Data",
      evaluasi: {
        kepuasan: 85,
        keaktifan: 80,
        perkembangan: 82,
        kendala: "Kesulitan memahami loop",
        tantangan: "Pemahaman fungsi",
        catatan_mentor: "Perlu latihan mandiri",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG12",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      date: "11-05-2025, 19:00",
      topic: "Data Cleaning dengan Pandas",
      evaluasi: {
        kepuasan: 91,
        keaktifan: 89,
        perkembangan: 90,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Sudah bagus",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG13",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "11-05-2025, 19:00",
      topic: "Handling Missing Values",
      evaluasi: {
        kepuasan: 88,
        keaktifan: 87,
        perkembangan: 85,
        kendala: "Dataset terlalu besar",
        tantangan: "Optimasi memory",
        catatan_mentor: "Cukup responsif",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG14",
      mentor: "Gilang Dirga",
      program: "Short Class",
      date: "11-05-2025, 19:00",
      topic: "Excel Pivot Table",
      evaluasi: {
        kepuasan: 0,
        keaktifan: 0,
        perkembangan: 0,
        kendala: "",
        tantangan: "",
        catatan_mentor: "",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG15",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      date: "11-05-2025, 19:00",
      topic: "Numpy Fundamental",
      evaluasi: {
        kepuasan: 92,
        keaktifan: 90,
        perkembangan: 93,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Sangat cepat memahami",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG16",
      mentor: "Laura Ayu",
      program: "Short Class",
      date: "11-05-2025, 19:00",
      topic: "Data Wrangling untuk Pemula",
      evaluasi: {
        kepuasan: 87,
        keaktifan: 89,
        perkembangan: 86,
        kendala: "Kesulitan filtering data",
        tantangan: "Manipulasi kolom kompleks",
        catatan_mentor: "Tetap semangat",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG17",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      date: "11-05-2025, 20:00",
      topic: "Machine Learning Dasar",
      evaluasi: {
        kepuasan: 0,
        keaktifan: 0,
        perkembangan: 0,
        kendala: "",
        tantangan: "",
        catatan_mentor: "",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG18",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      date: "11-05-2025, 20:00",
      topic: "Regresi Linear dari Nol",
      evaluasi: {
        kepuasan: 84,
        keaktifan: 83,
        perkembangan: 82,
        kendala: "Membingungkan saat visualisasi",
        tantangan: "Penentuan parameter optimal",
        catatan_mentor: "Lumayan bagus",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG19",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "11-05-2025, 20:00",
      topic: "KNN dan Evaluasi Model",
      evaluasi: {
        kepuasan: 95,
        keaktifan: 94,
        perkembangan: 93,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Luar biasa",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG20",
      mentor: "Gilang Dirga",
      program: "Short Class",
      date: "11-05-2025, 20:00",
      topic: "Statistik Dasar untuk Data",
      evaluasi: {
        kepuasan: 89,
        keaktifan: 90,
        perkembangan: 88,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Mudah mengikuti",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG21",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      date: "12-05-2025, 19:00",
      topic: "Descriptive Statistics",
      evaluasi: {
        kepuasan: 70,
        keaktifan: 65,
        perkembangan: 72,
        kendala: "Kesulitan memahami terminologi",
        tantangan: "",
        catatan_mentor: "Perlu mengulang materi",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG22",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "12-05-2025, 19:00",
      topic: "Data Visualization Best Practices",
      evaluasi: {
        kepuasan: 97,
        keaktifan: 96,
        perkembangan: 96,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Sangat berbakat",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG23",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      date: "12-05-2025, 19:00",
      topic: "Time Series Basics",
      evaluasi: {
        kepuasan: 76,
        keaktifan: 78,
        perkembangan: 79,
        kendala: "Sulit memahami trend/seasonality",
        tantangan: "",
        catatan_mentor: "Butuh latihan tambahan",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG24",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      date: "12-05-2025, 19:00",
      topic: "Clustering dengan K-Means",
      evaluasi: {
        kepuasan: 83,
        keaktifan: 82,
        perkembangan: 85,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Perkembangan stabil",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG25",
      mentor: "Laura Ayu",
      program: "Short Class",
      date: "12-05-2025, 19:00",
      topic: "EDA untuk Pemula",
      evaluasi: {
        kepuasan: 89,
        keaktifan: 88,
        perkembangan: 89,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Cukup detail",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG26",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      date: "12-05-2025, 20:00",
      topic: "SQL Dasar untuk Data Analyst",
      evaluasi: {
        kepuasan: 90,
        keaktifan: 89,
        perkembangan: 88,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Mudah memahami query",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG27",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      date: "12-05-2025, 20:00",
      topic: "SQL Join & Aggregation",
      evaluasi: {
        kepuasan: 93,
        keaktifan: 95,
        perkembangan: 92,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Sangat aktif dan teliti",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG28",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "12-05-2025, 20:00",
      topic: "Dashboard dengan PowerBI",
      evaluasi: {
        kepuasan: 78,
        keaktifan: 79,
        perkembangan: 80,
        kendala: "",
        tantangan: "Pemilihan chart kurang tepat",
        catatan_mentor: "Butuh latihan lebih sering",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG29",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      date: "12-05-2025, 20:00",
      topic: "Feature Engineering",
      evaluasi: {
        kepuasan: 85,
        keaktifan: 87,
        perkembangan: 86,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Cukup konsisten",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG30",
      mentor: "Gilang Dirga",
      program: "Short Class",
      date: "12-05-2025, 20:00",
      topic: "Hypothesis Testing",
      evaluasi: {
        kepuasan: 94,
        keaktifan: 93,
        perkembangan: 95,
        kendala: "",
        tantangan: "",
        catatan_mentor: "Pemahaman kuat",
        catatan_tambahan: "",
      },
    },
  ]);

  const stats = [
    {
      title: "Total Feedback Mentor",
      value: "80",
      image: "/assets/admin/totalFeedback.svg",
      color: "text-gray-900",
      change: "+12%",
    },
    {
      title: "Sudah Diisi",
      value: "78",
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
      change: "+5%",
    },
    {
      title: "Belum Diisi",
      value: "2",
      image: "/assets/admin/menteenonac.svg",
      color: "text-orange-600",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Feedback Mentor
          </h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Feedback Mentor</span>
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

      {/* Stats Cards */}
      <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="max-w-[340px] w-full flex flex-col justify-between px-0 py-2
      shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
      cursor-pointer rounded-lg bg-white"
          >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-2">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={20}
                  height={20}
                  className="opacity-90"
                />
                <CardTitle className="text-md font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-500" />
            </CardHeader>

            {/* Content */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p className={`text-4xl font-bold leading-tight ${stat.color}`}>
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
        Daftar Feedback Mentor
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={datas} />
      </Card>
    </>
  );
}
