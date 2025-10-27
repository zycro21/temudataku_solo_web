"use client";

import { useState } from "react";
import { FileText, Download, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DataTable } from "./data-table";
import { columns, Project } from "./columns";

export default function AdminMentorPage() {
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
  ]);

  const stats = [
    { title: "Total Transaksi", value: "80", icon: FileText, color: "text-gray-900" },
    { title: "Berhasil", value: "78", icon: CheckCircle, color: "text-green-600" },
    { title: "Proses", value: "2", icon: CheckCircle, color: "text-green-600" },
    { title: "Gagal", value: "2", icon: Clock, color: "text-orange-600" },
    { title: "Dikembalikan", value: "2", icon: Clock, color: "text-orange-600" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-600">Transaksi</p>
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
        <h2 className="text-lg font-semibold text-gray-900">Daftar Transaksi</h2>
        <DataTable columns={columns} data={projects} />
      </Card>
    </>
  );
}
