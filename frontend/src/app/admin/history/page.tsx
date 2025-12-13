"use client";

import { useState } from "react";
import { Download, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable as DataTableSertifikatTerbit } from "./history-aktivitas/data-table";
import { DataTable as DataTableSertifikatMentee } from "./login-history/data-table";
import {
  columns as columnsSertifikatTerbit,
  historyAktivitas,
} from "./history-aktivitas/columns";
import {
  columns as columnsMentee,
  loginHistory,
} from "./login-history/columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

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
      role: "Mentee",
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

    // --- Tambahan 20 data baru (role diperbaiki) ---
    {
      id: "HA005",
      date: "10-05-2025, 20:20",
      namaPengguna: "Dian Sari",
      role: "Mentee",
      aktivitas: "Menambah data peserta",
      ipAddress: "192.168.1.14",
      status: "berhasil",
    },
    {
      id: "HA006",
      date: "10-05-2025, 20:25",
      namaPengguna: "Aulia Rahma",
      role: "Mentor",
      aktivitas: "Mengupload materi baru",
      ipAddress: "192.168.1.15",
      status: "berhasil",
    },
    {
      id: "HA007",
      date: "10-05-2025, 20:30",
      namaPengguna: "Rangga Putra",
      role: "Admin",
      aktivitas: "Mengubah hak akses pengguna",
      ipAddress: "192.168.1.16",
      status: "berhasil",
    },
    {
      id: "HA008",
      date: "10-05-2025, 20:35",
      namaPengguna: "Siti Aminah",
      role: "Mentee",
      aktivitas: "Gagal menambah program",
      ipAddress: "192.168.1.17",
      status: "gagal",
    },
    {
      id: "HA009",
      date: "10-05-2025, 20:40",
      namaPengguna: "Dian Sari",
      role: "Mentee",
      aktivitas: "Melihat detail peserta",
      ipAddress: "192.168.1.18",
      status: "berhasil",
    },
    {
      id: "HA010",
      date: "10-05-2025, 20:45",
      namaPengguna: "Aulia Rahma",
      role: "Mentor",
      aktivitas: "Gagal upload materi",
      ipAddress: "192.168.1.19",
      status: "gagal",
    },
    {
      id: "HA011",
      date: "10-05-2025, 20:50",
      namaPengguna: "Reza Firmansyah",
      role: "Admin",
      aktivitas: "Menghapus data program",
      ipAddress: "192.168.1.20",
      status: "berhasil",
    },
    {
      id: "HA012",
      date: "10-05-2025, 20:55",
      namaPengguna: "Budi Santoso",
      role: "Mentee",
      aktivitas: "Mengedit data user",
      ipAddress: "192.168.1.21",
      status: "berhasil",
    },
    {
      id: "HA013",
      date: "10-05-2025, 21:00",
      namaPengguna: "Siti Aminah",
      role: "Mentee",
      aktivitas: "Gagal memperbarui pembayaran",
      ipAddress: "192.168.1.22",
      status: "gagal",
    },
    {
      id: "HA014",
      date: "10-05-2025, 21:05",
      namaPengguna: "Rangga Putra",
      role: "Admin",
      aktivitas: "Reset password pengguna",
      ipAddress: "192.168.1.23",
      status: "berhasil",
    },
    {
      id: "HA015",
      date: "10-05-2025, 21:10",
      namaPengguna: "Dian Sari",
      role: "Mentee",
      aktivitas: "Mengakses halaman laporan",
      ipAddress: "192.168.1.24",
      status: "berhasil",
    },
    {
      id: "HA016",
      date: "10-05-2025, 21:15",
      namaPengguna: "Aulia Rahma",
      role: "Mentor",
      aktivitas: "Menambah kuis baru",
      ipAddress: "192.168.1.25",
      status: "berhasil",
    },
    {
      id: "HA017",
      date: "10-05-2025, 21:20",
      namaPengguna: "Reza Firmansyah",
      role: "Admin",
      aktivitas: "Mengedit kategori program",
      ipAddress: "192.168.1.26",
      status: "berhasil",
    },
    {
      id: "HA018",
      date: "10-05-2025, 21:25",
      namaPengguna: "Budi Santoso",
      role: "Mentee",
      aktivitas: "Menghapus data peserta",
      ipAddress: "192.168.1.27",
      status: "berhasil",
    },
    {
      id: "HA019",
      date: "10-05-2025, 21:30",
      namaPengguna: "Siti Aminah",
      role: "Mentee",
      aktivitas: "Gagal menghapus materi",
      ipAddress: "192.168.1.28",
      status: "gagal",
    },
    {
      id: "HA020",
      date: "10-05-2025, 21:35",
      namaPengguna: "Rangga Putra",
      role: "Admin",
      aktivitas: "Login ke sistem",
      ipAddress: "192.168.1.29",
      status: "berhasil",
    },
    {
      id: "HA021",
      date: "10-05-2025, 21:40",
      namaPengguna: "Dian Sari",
      role: "Mentee",
      aktivitas: "Mengedit profil mentor",
      ipAddress: "192.168.1.30",
      status: "berhasil",
    },
    {
      id: "HA022",
      date: "10-05-2025, 21:45",
      namaPengguna: "Aulia Rahma",
      role: "Mentor",
      aktivitas: "Gagal memperbarui nilai kuis",
      ipAddress: "192.168.1.31",
      status: "gagal",
    },
    {
      id: "HA023",
      date: "10-05-2025, 21:50",
      namaPengguna: "Reza Firmansyah",
      role: "Admin",
      aktivitas: "Menambah user baru",
      ipAddress: "192.168.1.32",
      status: "berhasil",
    },
    {
      id: "HA024",
      date: "10-05-2025, 21:55",
      namaPengguna: "Budi Santoso",
      role: "Mentee",
      aktivitas: "Mengunduh dokumen",
      ipAddress: "192.168.1.33",
      status: "berhasil",
    },
  ];

  const loginHistory: loginHistory[] = [
    {
      id: "LGN001",
      date: "10-05-2025, 20:00",
      namaPengguna: "Jehan Ra",
      role: "Mentee",
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
    {
      id: "LGN004",
      date: "10-05-2025, 20:20",
      namaPengguna: "Dimas P",
      role: "Affiliator",
      perangkat: "Chrome / Android",
      ipAddress: "192.168.1.33",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN005",
      date: "10-05-2025, 20:25",
      namaPengguna: "Aulia K",
      role: "Mentee",
      perangkat: "Safari / iOS",
      ipAddress: "192.168.1.44",
      status: "gagal",
      aksi: "Login",
    },
    {
      id: "LGN006",
      date: "10-05-2025, 20:30",
      namaPengguna: "Bagas R",
      role: "Mentor",
      perangkat: "Edge / Windows",
      ipAddress: "192.168.1.77",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN007",
      date: "10-05-2025, 20:31",
      namaPengguna: "Citra Ayu",
      role: "Admin",
      perangkat: "Chrome / MacOS",
      ipAddress: "192.168.1.88",
      status: "berhasil",
      aksi: "Logout",
    },
    {
      id: "LGN008",
      date: "10-05-2025, 20:33",
      namaPengguna: "Fajar H",
      role: "Affiliator",
      perangkat: "Chrome / Windows",
      ipAddress: "192.168.1.99",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN009",
      date: "10-05-2025, 20:40",
      namaPengguna: "Hani R",
      role: "Mentee",
      perangkat: "Firefox / Linux",
      ipAddress: "192.168.1.111",
      status: "gagal",
      aksi: "Login",
    },
    {
      id: "LGN010",
      date: "10-05-2025, 20:45",
      namaPengguna: "Rafi A",
      role: "Mentor",
      perangkat: "Safari / MacOS",
      ipAddress: "192.168.1.121",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN011",
      date: "10-05-2025, 20:50",
      namaPengguna: "Sinta L",
      role: "Admin",
      perangkat: "Chrome / Windows",
      ipAddress: "192.168.1.131",
      status: "berhasil",
      aksi: "Logout",
    },
    {
      id: "LGN012",
      date: "10-05-2025, 20:55",
      namaPengguna: "Yoga M",
      role: "Mentor",
      perangkat: "Edge / Windows",
      ipAddress: "192.168.1.141",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN013",
      date: "10-05-2025, 21:00",
      namaPengguna: "Nadila W",
      role: "Affiliator",
      perangkat: "Chrome / Android",
      ipAddress: "192.168.1.151",
      status: "gagal",
      aksi: "Login",
    },
    {
      id: "LGN014",
      date: "10-05-2025, 21:05",
      namaPengguna: "Zidan R",
      role: "Mentee",
      perangkat: "Safari / iOS",
      ipAddress: "192.168.1.161",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN015",
      date: "10-05-2025, 21:10",
      namaPengguna: "Farhan J",
      role: "Mentor",
      perangkat: "Chrome / Windows",
      ipAddress: "192.168.1.171",
      status: "berhasil",
      aksi: "Logout",
    },
    {
      id: "LGN016",
      date: "10-05-2025, 21:12",
      namaPengguna: "Latifa S",
      role: "Admin",
      perangkat: "Firefox / Linux",
      ipAddress: "192.168.1.181",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN017",
      date: "10-05-2025, 21:15",
      namaPengguna: "Kevin M",
      role: "Affiliator",
      perangkat: "Safari / MacOS",
      ipAddress: "192.168.1.191",
      status: "gagal",
      aksi: "Login",
    },
    {
      id: "LGN018",
      date: "10-05-2025, 21:18",
      namaPengguna: "Rara Putri",
      role: "Mentee",
      perangkat: "Chrome / Windows",
      ipAddress: "192.168.1.201",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN019",
      date: "10-05-2025, 21:20",
      namaPengguna: "Wawan K",
      role: "Mentor",
      perangkat: "Edge / Windows",
      ipAddress: "192.168.1.211",
      status: "berhasil",
      aksi: "Login",
    },
    {
      id: "LGN020",
      date: "10-05-2025, 21:22",
      namaPengguna: "Aurel N",
      role: "Admin",
      perangkat: "Chrome / MacOS",
      ipAddress: "192.168.1.221",
      status: "berhasil",
      aksi: "Logout",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">History</h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            History & Security
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">History</span>
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

      {/* DataTable sertifikat terbit */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        History Aktivitas
      </h2>
      <Card className="p-6">
        <DataTableSertifikatTerbit
          columns={columnsSertifikatTerbit}
          data={historyAktivitas}
        />
      </Card>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3 mt-5">
        Login History
      </h2>
      <Card className="p-6 mt-5">
        <DataTableSertifikatMentee
          columns={columnsMentee}
          data={loginHistory}
        />
      </Card>
    </>
  );
}
