"use client";

import { Download, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DataTable as DataTableSertifikatTerbit } from "./history-aktivitas/data-table";
import { DataTable as DataTableSertifikatMentee } from "./login-history/data-table";
import { columns as columnsSertifikatTerbit, historyAktivitas } from "./history-aktivitas/columns";
import { columns as columnsMentee, loginHistory } from "./login-history/columns";
export default function AdminMentorPage() {
  const historyAktivitas: historyAktivitas[] = [
    {
      id: "HA001",
      date: "10-05-2025, 20:00",
      namaPengguna: "Reza Firmansyah",
      role: "Admin",
      aktivitas: "Login ke sistem",
      ipAddress: "192.168.1.10",
      status: "berhasil",
    },
    {
      id: "HA002",
      date: "10-05-2025, 20:05",
      namaPengguna: "Aulia Rahma",
      role: "Mentor",
      aktivitas: "Mengubah data program",
      ipAddress: "192.168.1.11",
      status: "berhasil",
    },
    {
      id: "HA003",
      date: "10-05-2025, 20:10",
      namaPengguna: "Budi Santoso",
      role: "Staff",
      aktivitas: "Gagal menghapus user",
      ipAddress: "192.168.1.12",
      status: "gagal",
    },
    {
      id: "HA004",
      date: "10-05-2025, 20:15",
      namaPengguna: "Reza Firmansyah",
      role: "Admin",
      aktivitas: "Export laporan",
      ipAddress: "192.168.1.13",
      status: "berhasil",
    },
  ];

  const loginHistory: loginHistory[] = [
    {
      id: "LGN001",
      date: "10-05-2025, 20:00",
      namaPengguna: "Jehan Ra",
      role: "Mahasiswa",
      perangkat: "Chrome / Windows",
      ipAddress: "192.168.1.10",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN002",
      date: "10-05-2025, 20:10",
      namaPengguna: "Galih B",
      role: "Mentor",
      perangkat: "Safari / MacOS",
      ipAddress: "192.168.1.22",
      status: "gagal",
      aksi: "Login",
    },
    {
      id: "LGN003",
      date: "10-05-2025, 20:15",
      namaPengguna: "Rahma S",
      role: "Admin",
      perangkat: "Firefox / Linux",
      ipAddress: "192.168.1.55",
      status: "berhasil",
      aksi: "Logout",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History & Security</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            <span>History & Event</span>
            <ChevronDown className="w-4 h-4 -rotate-90" />
            <span>History</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {/* DataTable sertifikat terbit */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">History Aktivitas</h2>
        <DataTableSertifikatTerbit columns={columnsSertifikatTerbit} data={historyAktivitas} />
      </Card>
      <Card className="p-6 mt-5">
        <h2 className="text-lg font-semibold text-gray-900">Login History</h2>
        <DataTableSertifikatMentee columns={columnsMentee} data={loginHistory} />
      </Card>
    </>
  );
}
