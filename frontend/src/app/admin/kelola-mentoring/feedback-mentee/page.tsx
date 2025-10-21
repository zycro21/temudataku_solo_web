"use client";

import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DataTable } from "./data-table";
import { columns, Datas } from "./columns";

export default function AdminMentorPage() {
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
        masukkan: "Sesi berjalan lancar, hanya perlu lebih banyak contoh kasus.",
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
  ]);

  const stats = [{ title: "Total Feedback Mentor", value: "80", icon: FileText, color: "text-gray-900" }];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Mentee</h1>
          <p className="text-gray-600">Feedback</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DataTable */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Daftar Feedback Mentee</h2>
        <DataTable columns={columns} data={datas} />
      </Card>
    </>
  );
}
