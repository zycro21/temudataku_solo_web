"use client";

import { useState } from "react";
import { FileText, Download, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DataTable } from "./data-table";
import { columns, Datas } from "./columns";

export default function AdminMentorPage() {
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
  ]);

  const stats = [
    { title: "Total Feedback Mentor", value: "80", icon: FileText, color: "text-gray-900" },
    { title: "Sudah Diisi", value: "78", icon: CheckCircle, color: "text-green-600" },
    { title: "Belum Diisi", value: "2", icon: Clock, color: "text-orange-600" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Mentor</h1>
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
        <h2 className="text-lg font-semibold text-gray-900">Daftar Feedback Mentor</h2>
        <DataTable columns={columns} data={datas} />
      </Card>
    </>
  );
}
