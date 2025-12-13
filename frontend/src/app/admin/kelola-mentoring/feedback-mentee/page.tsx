"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FileText,
  Download,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./data-table";
import { columns, Datas } from "./columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const [datas] = useState<Datas[]>([
    {
      id: "MNTG01",
      mentor: "Gilang Dirga",
      mentee: "Kevin Mendoza",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kemudahan_materi: 85,
        kejelasan_materi: 80,
        mentor_menjawab: 90,
        pelaksanaan: 88,
        kesesuaian_jadwal: 85,
        kualitas_platform: 82,
        masukkan: "Materi cukup jelas, tapi tempo pembelajaran agak cepat.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG02",
      mentor: "Gilang Dirga",
      mentee: "Jehan Ra",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Introduction to Data Science",
      evaluasi: {
        kemudahan_materi: 80,
        kejelasan_materi: 85,
        mentor_menjawab: 88,
        pelaksanaan: 84,
        kesesuaian_jadwal: 90,
        kualitas_platform: 87,
        masukkan: "Mentor sangat komunikatif dan mudah diajak diskusi.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG03",
      mentor: "Nina Pratiwi",
      mentee: "Galih B",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Belajar Data Science dari Nol",
      evaluasi: {
        kemudahan_materi: 78,
        kejelasan_materi: 80,
        mentor_menjawab: 82,
        pelaksanaan: 85,
        kesesuaian_jadwal: 88,
        kualitas_platform: 90,
        masukkan:
          "Sesi berjalan lancar, hanya perlu lebih banyak contoh kasus.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG04",
      mentor: "Nina Pratiwi",
      mentee: "Bonda Prakoso",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 85,
        kejelasan_materi: 87,
        mentor_menjawab: 90,
        pelaksanaan: 88,
        kesesuaian_jadwal: 92,
        kualitas_platform: 89,
        masukkan: "Penjelasan mudah dimengerti, tampilan platform bagus.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG05",
      mentor: "Laura Ayu",
      mentee: "Darwin Nunez",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 90,
        kejelasan_materi: 88,
        mentor_menjawab: 92,
        pelaksanaan: 89,
        kesesuaian_jadwal: 90,
        kualitas_platform: 91,
        masukkan: "Sangat informatif dan mudah diikuti.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG06",
      mentor: "Gilang Dirga",
      mentee: "Jehan Ra",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 92,
        kejelasan_materi: 90,
        mentor_menjawab: 91,
        pelaksanaan: 89,
        kesesuaian_jadwal: 93,
        kualitas_platform: 92,
        masukkan: "Materi padat tapi sangat berguna.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG07",
      mentor: "Laura Ayu",
      mentee: "Kevin Mendoza",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 88,
        kejelasan_materi: 85,
        mentor_menjawab: 90,
        pelaksanaan: 87,
        kesesuaian_jadwal: 88,
        kualitas_platform: 85,
        masukkan: "Perlu lebih banyak waktu latihan mandiri.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG08",
      mentor: "Laura Ayu",
      mentee: "Galih B",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 90,
        kejelasan_materi: 92,
        mentor_menjawab: 95,
        pelaksanaan: 90,
        kesesuaian_jadwal: 91,
        kualitas_platform: 93,
        masukkan: "Sangat puas dengan mentor dan materi.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG09",
      mentor: "Laura Ayu",
      mentee: "Bonda Prakoso",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 99,
        kejelasan_materi: 98,
        mentor_menjawab: 97,
        pelaksanaan: 99,
        kesesuaian_jadwal: 100,
        kualitas_platform: 98,
        masukkan: "Luar biasa! Tidak ada kekurangan sama sekali.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG10",
      mentor: "Nina Pratiwi",
      mentee: "Darwin Nunez",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kemudahan_materi: 82,
        kejelasan_materi: 84,
        mentor_menjawab: 83,
        pelaksanaan: 85,
        kesesuaian_jadwal: 87,
        kualitas_platform: 88,
        masukkan: "Materi mudah, hanya perlu sedikit waktu untuk latihan.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG11",
      mentor: "Gilang Dirga",
      mentee: "Andi Saputra",
      program: "Bootcamp",
      date: "11-05-2025, 19:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kemudahan_materi: 84,
        kejelasan_materi: 82,
        mentor_menjawab: 90,
        pelaksanaan: 86,
        kesesuaian_jadwal: 88,
        kualitas_platform: 85,
        masukkan: "Materi cukup praktis, contoh lebih diperbanyak akan bagus.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG12",
      mentor: "Laura Ayu",
      mentee: "Rina Destiana",
      program: "Short Class",
      date: "11-05-2025, 19:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 91,
        kejelasan_materi: 89,
        mentor_menjawab: 94,
        pelaksanaan: 90,
        kesesuaian_jadwal: 92,
        kualitas_platform: 90,
        masukkan: "Penjelasan sangat detail dan mudah diikuti.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG13",
      mentor: "Nina Pratiwi",
      mentee: "Bagas Permana",
      program: "Bootcamp",
      date: "11-05-2025, 19:00",
      topic: "Belajar Data Science dari Nol",
      evaluasi: {
        kemudahan_materi: 79,
        kejelasan_materi: 81,
        mentor_menjawab: 85,
        pelaksanaan: 82,
        kesesuaian_jadwal: 84,
        kualitas_platform: 83,
        masukkan: "Perlu lebih banyak latihan langsung.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG14",
      mentor: "Gilang Dirga",
      mentee: "Samuel Putra",
      program: "Bootcamp",
      date: "11-05-2025, 19:00",
      topic: "Introduction to Data Science",
      evaluasi: {
        kemudahan_materi: 88,
        kejelasan_materi: 87,
        mentor_menjawab: 90,
        pelaksanaan: 89,
        kesesuaian_jadwal: 90,
        kualitas_platform: 85,
        masukkan: "Sangat informatif dan aplikatif.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG15",
      mentor: "Laura Ayu",
      mentee: "Tasya Amelia",
      program: "Short Class",
      date: "11-05-2025, 19:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kemudahan_materi: 90,
        kejelasan_materi: 92,
        mentor_menjawab: 93,
        pelaksanaan: 91,
        kesesuaian_jadwal: 90,
        kualitas_platform: 92,
        masukkan: "Materi sangat jelas untuk pemula.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG16",
      mentor: "Nina Pratiwi",
      mentee: "Satria Wibawa",
      program: "Bootcamp",
      date: "12-05-2025, 20:00",
      topic: "Belajar Data Science dari Nol",
      evaluasi: {
        kemudahan_materi: 82,
        kejelasan_materi: 84,
        mentor_menjawab: 88,
        pelaksanaan: 85,
        kesesuaian_jadwal: 86,
        kualitas_platform: 87,
        masukkan: "Cocok untuk pemula, namun sesi cukup padat.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG17",
      mentor: "Laura Ayu",
      mentee: "Alya Nurmala",
      program: "Bootcamp",
      date: "12-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 93,
        kejelasan_materi: 94,
        mentor_menjawab: 96,
        pelaksanaan: 92,
        kesesuaian_jadwal: 94,
        kualitas_platform: 95,
        masukkan: "Mentor sangat ramah dan detail.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG18",
      mentor: "Gilang Dirga",
      mentee: "Rafi Ihsan",
      program: "Bootcamp",
      date: "12-05-2025, 20:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kemudahan_materi: 78,
        kejelasan_materi: 79,
        mentor_menjawab: 80,
        pelaksanaan: 82,
        kesesuaian_jadwal: 84,
        kualitas_platform: 83,
        masukkan: "Materi lumayan sulit di awal.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG19",
      mentor: "Nina Pratiwi",
      mentee: "Iqbal Ramadhan",
      program: "Short Class",
      date: "12-05-2025, 20:00",
      topic: "Introduction to Data Science",
      evaluasi: {
        kemudahan_materi: 86,
        kejelasan_materi: 85,
        mentor_menjawab: 87,
        pelaksanaan: 88,
        kesesuaian_jadwal: 89,
        kualitas_platform: 90,
        masukkan: "Penjelasan baik, sesi cukup singkat.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG20",
      mentor: "Laura Ayu",
      mentee: "Denis Alvaro",
      program: "Bootcamp",
      date: "12-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 90,
        kejelasan_materi: 91,
        mentor_menjawab: 93,
        pelaksanaan: 94,
        kesesuaian_jadwal: 95,
        kualitas_platform: 92,
        masukkan: "Top! Tidak ada kendala berarti.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG21",
      mentor: "Nina Pratiwi",
      mentee: "Putri Cahya",
      program: "Bootcamp",
      date: "13-05-2025, 19:00",
      topic: "Belajar Data Science dari Nol",
      evaluasi: {
        kemudahan_materi: 84,
        kejelasan_materi: 83,
        mentor_menjawab: 86,
        pelaksanaan: 85,
        kesesuaian_jadwal: 86,
        kualitas_platform: 87,
        masukkan: "Mentor komunikatif, tempo cukup cepat.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG22",
      mentor: "Gilang Dirga",
      mentee: "Dio Pratama",
      program: "Short Class",
      date: "13-05-2025, 19:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kemudahan_materi: 87,
        kejelasan_materi: 89,
        mentor_menjawab: 88,
        pelaksanaan: 90,
        kesesuaian_jadwal: 91,
        kualitas_platform: 89,
        masukkan: "Materi sangat berguna untuk pekerjaan.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG23",
      mentor: "Gilang Dirga",
      mentee: "Yuda Prabowo",
      program: "Bootcamp",
      date: "13-05-2025, 19:00",
      topic: "Introduction to Data Science",
      evaluasi: {
        kemudahan_materi: 82,
        kejelasan_materi: 83,
        mentor_menjawab: 87,
        pelaksanaan: 84,
        kesesuaian_jadwal: 83,
        kualitas_platform: 85,
        masukkan: "Contoh real case membantu pemahaman.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG24",
      mentor: "Laura Ayu",
      mentee: "Stefani Olivia",
      program: "Bootcamp",
      date: "13-05-2025, 19:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 95,
        kejelasan_materi: 96,
        mentor_menjawab: 94,
        pelaksanaan: 93,
        kesesuaian_jadwal: 95,
        kualitas_platform: 96,
        masukkan: "Mentor sangat profesional.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG25",
      mentor: "Nina Pratiwi",
      mentee: "Rendi Firmansyah",
      program: "Bootcamp",
      date: "13-05-2025, 19:00",
      topic: "Belajar Data Science dari Nol",
      evaluasi: {
        kemudahan_materi: 81,
        kejelasan_materi: 82,
        mentor_menjawab: 85,
        pelaksanaan: 84,
        kesesuaian_jadwal: 86,
        kualitas_platform: 88,
        masukkan: "Cukup baik, hanya tempo agak cepat.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG26",
      mentor: "Laura Ayu",
      mentee: "Miranda Putri",
      program: "Short Class",
      date: "14-05-2025, 20:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kemudahan_materi: 92,
        kejelasan_materi: 94,
        mentor_menjawab: 95,
        pelaksanaan: 93,
        kesesuaian_jadwal: 92,
        kualitas_platform: 94,
        masukkan: "Penjelasan sangat rapi dan mudah.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG27",
      mentor: "Gilang Dirga",
      mentee: "Darren Farel",
      program: "Live Class",
      date: "14-05-2025, 20:00",
      topic: "Introduction to Data Science",
      evaluasi: {
        kemudahan_materi: 80,
        kejelasan_materi: 82,
        mentor_menjawab: 84,
        pelaksanaan: 83,
        kesesuaian_jadwal: 85,
        kualitas_platform: 86,
        masukkan: "Sesi cukup membantu pemahaman.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG28",
      mentor: "Nina Pratiwi",
      mentee: "Bima Arya",
      program: "Bootcamp",
      date: "14-05-2025, 20:00",
      topic: "Belajar Data Science dari Nol",
      evaluasi: {
        kemudahan_materi: 89,
        kejelasan_materi: 88,
        mentor_menjawab: 90,
        pelaksanaan: 87,
        kesesuaian_jadwal: 89,
        kualitas_platform: 90,
        masukkan: "Materi sangat membantu pemula.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG29",
      mentor: "Laura Ayu",
      mentee: "Mira Yolanda",
      program: "Short Class",
      date: "14-05-2025, 20:00",
      topic: "Visualisasi Data dengan Matplotlib",
      evaluasi: {
        kemudahan_materi: 91,
        kejelasan_materi: 92,
        mentor_menjawab: 94,
        pelaksanaan: 93,
        kesesuaian_jadwal: 94,
        kualitas_platform: 92,
        masukkan: "Visualisasi sangat mudah dipahami.",
        catatan_tambahan: "",
      },
    },
    {
      id: "MNTG30",
      mentor: "Gilang Dirga",
      mentee: "Aditiya Yudha",
      program: "Bootcamp",
      date: "14-05-2025, 20:00",
      topic: "Excel Untuk Pemula",
      evaluasi: {
        kemudahan_materi: 88,
        kejelasan_materi: 87,
        mentor_menjawab: 90,
        pelaksanaan: 89,
        kesesuaian_jadwal: 90,
        kualitas_platform: 91,
        masukkan: "Sangat membantu untuk pemula.",
        catatan_tambahan: "",
      },
    },
  ]);

  const stats = [
    {
      title: "Total Feedback Mentor",
      value: "80",
      image: "/assets/admin/totalFeedback.svg", // ganti sesuai lokasi icon kamu
      color: "text-gray-900",
      change: "+12%",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Feedback Mentee
          </h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Feedback Mentee</span>
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
      <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
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
        Daftar Feedback Mentee
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={datas} />
      </Card>
    </>
  );
}
