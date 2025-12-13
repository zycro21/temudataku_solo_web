"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
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
import { columns, Project } from "./columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const [projects] = useState<Project[]>([
    {
      id: "TRX001",
      mentee: "Jehan Ra",
      mentor: "Gilang Dirga",
      program: "Short Class",
      topic: "Excel Untuk Pemula",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Belum Dibayar",
      alasan: "-",
    },
    {
      id: "TRX002",
      mentee: "Galih B",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      topic: "Introduction to Data Science",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Belum Dibayar",
      alasan: "-",
    },
    {
      id: "TRX003",
      mentee: "Bonda Prakoso",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topic: "Belajar Data Science dari Nol",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Belum Dibayar",
      alasan: "-",
    },
    {
      id: "TRX004",
      mentee: "Kepa",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topic: "Visualisasi Data dengan Matplotlib",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Menunggu Konfirmasi",
      alasan: "-",
    },
    {
      id: "TRX005",
      mentee: "Darwin Nunez",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      topic: "Visualisasi Data dengan Matplotlib",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX006",
      mentee: "Marc Marquez",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      topic: "Visualisasi Data dengan Matplotlib",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX007",
      mentee: "Rafael Struick",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      topic: "Visualisasi Data dengan Matplotlib",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX008",
      mentee: "Marteen Paes",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      topic: "Visualisasi Data dengan Matplotlib",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX009",
      mentee: "Kevin Mendoza",
      mentor: "Laura Ayu",
      program: "Short Class",
      topic: "Visualisasi Data dengan Matplotlib",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX010",
      mentee: "Lorenzo",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      topic: "Excel Untuk Pemula",
      date: "10-05-2025, 20:00",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Dibatalkan",
      alasan: "Pembayaran gagal diverifikasi",
    },

    // -------------------------------------------
    // 🔽 Tambahan 15 data baru (TRX011–TRX025)
    // -------------------------------------------

    {
      id: "TRX011",
      mentee: "Bagas Putra",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      topic: "Machine Learning Dasar",
      date: "11-05-2025, 19:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Belum Dibayar",
      alasan: "-",
    },
    {
      id: "TRX012",
      mentee: "Dewi Anggraini",
      mentor: "Laura Ayu",
      program: "Short Class",
      topic: "Excel Untuk Pemula",
      date: "11-05-2025, 19:00",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Menunggu Konfirmasi",
      alasan: "-",
    },
    {
      id: "TRX013",
      mentee: "Fadli Hadi",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topic: "Data Cleaning dengan Python",
      date: "11-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX014",
      mentee: "Rio Saputra",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      topic: "Pengenalan SQL untuk Data Analyst",
      date: "11-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Belum Dibayar",
      alasan: "-",
    },
    {
      id: "TRX015",
      mentee: "Anita Lestari",
      mentor: "Gilang Dirga",
      program: "Short Class",
      topic: "Excel Untuk Pemula",
      date: "11-05-2025, 18:00",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX016",
      mentee: "Vicky Kurnia",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topic: "Membangun Dashboard dengan Power BI",
      date: "12-05-2025, 19:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX017",
      mentee: "Samuel Hartono",
      mentor: "Laura Ayu",
      program: "Short Class",
      topic: "Belajar Tableau untuk Visualisasi",
      date: "12-05-2025, 19:30",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Dibatalkan",
      alasan: "Mentee meminta refund",
    },
    {
      id: "TRX018",
      mentee: "Rizky Ananda",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      topic: "Intermediate Machine Learning",
      date: "12-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Menunggu Konfirmasi",
      alasan: "-",
    },
    {
      id: "TRX019",
      mentee: "Siti Maulida",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      topic: "Excel Untuk Pemula",
      date: "12-05-2025, 18:00",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Belum Dibayar",
      alasan: "-",
    },
    {
      id: "TRX020",
      mentee: "Yusuf Ramadhan",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      topic: "Data Visualization Advanced",
      date: "13-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX021",
      mentee: "Nadya Melani",
      mentor: "Gilang Dirga",
      program: "Short Class",
      topic: "Analisis Data untuk Pemula",
      date: "13-05-2025, 17:00",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Menunggu Konfirmasi",
      alasan: "-",
    },
    {
      id: "TRX022",
      mentee: "Randi Saputro",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topic: "Fundamental Python untuk Data",
      date: "13-05-2025, 20:30",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Belum Dibayar",
      alasan: "-",
    },
    {
      id: "TRX023",
      mentee: "Chintia Putri",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      topic: "Statistik untuk Data Analyst",
      date: "13-05-2025, 19:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX024",
      mentee: "Davin Wijaya",
      mentor: "Gilang Dirga",
      program: "Short Class",
      topic: "Excel Lanjutan",
      date: "14-05-2025, 18:00",
      totalHarga: "Rp 150.000",
      statusTransaksi: "Selesai",
      alasan: "-",
    },
    {
      id: "TRX025",
      mentee: "Felicia Wulandari",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topic: "Data Analyst Career Preparation",
      date: "14-05-2025, 20:00",
      totalHarga: "Rp 850.000",
      statusTransaksi: "Belum Dibayar",
      alasan: "-",
    },
  ]);

  const stats = [
    {
      title: "Total Transaksi",
      value: "80",
      image: "/assets/admin/trans.svg",
      color: "text-gray-900",
    },
    {
      title: "Berhasil",
      value: "78",
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
    {
      title: "Proses",
      value: "2",
      image: "/assets/admin/penjadwalanulang.svg",
      color: "text-green-600",
    },
    {
      title: "Gagal",
      value: "2",
      image: "/assets/admin/menteenonac.svg",
      color: "text-orange-600",
    },
    {
      title: "Dikembalikan",
      value: "2",
      image: "/assets/admin/transdikembalikan.svg",
      color: "text-orange-600",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Transaksi
          </h1>
          <p className="text-gray-600">Transaksi</p>
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
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="w-full flex flex-col justify-between px-0 py-2
      shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
      cursor-pointer rounded-lg bg-white"
          >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-2">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={16} // ukuran kecil
                  height={16}
                  className="opacity-90"
                />
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-500" />
            </CardHeader>

            {/* Content */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p className={`text-3xl font-bold leading-tight ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Daftar Transaksi
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={projects} />
      </Card>
    </>
  );
}
