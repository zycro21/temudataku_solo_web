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
      id: "MNTG01",
      mentee: "Jehan Ra",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG02",
      mentee: "Galih B",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG03",
      mentee: "Bonda Prakoso",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG04",
      mentee: "Kepa",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG05",
      mentee: "Darwin Nunez",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG06",
      mentee: "Marc Marquez",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG07",
      mentee: "Rafael Struick",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG08",
      mentee: "Marteen Paes",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG09",
      mentee: "Kevin Mendoza",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG10",
      mentee: "Lorenzo",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },

    // 🔥 --- 20 Data Tambahan --- 🔥

    {
      id: "MNTG11",
      mentee: "Ariel Putra",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG12",
      mentee: "Rizky Saputra",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG13",
      mentee: "Dio Mahendra",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG14",
      mentee: "Farel Aji",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG15",
      mentee: "Yoga Pratama",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG16",
      mentee: "Samuel Adrian",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG17",
      mentee: "Fikri Fauzan",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG18",
      mentee: "Reynaldi",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG19",
      mentee: "Jordy Marcell",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG20",
      mentee: "Dimas Pangestu",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG21",
      mentee: "Reza Alwan",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG22",
      mentee: "Sandro",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG23",
      mentee: "Bagas Putro",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG24",
      mentee: "Jonathan",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG25",
      mentee: "Vito",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG26",
      mentee: "Arlando",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG27",
      mentee: "Jordan Alfi",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
    {
      id: "MNTG28",
      mentee: "Yohanes",
      date: "10-05-2025, 20:00",
      submissionStatus: "belum dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG29",
      mentee: "Ronaldo",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "belum direview",
    },
    {
      id: "MNTG30",
      mentee: "Felix",
      date: "10-05-2025, 20:00",
      submissionStatus: "sudah dikumpulkan",
      reviewStatus: "sudah direview",
    },
  ]);

  const stats = [
    {
      title: "Total Sesi Practice",
      value: "80",
      image: "/assets/dashboard/user/materi.svg",
      color: "text-gray-900",
    },
    {
      title: "Sudah Dikumpulkan",
      value: "78",
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
    {
      title: "Sudah Direview",
      value: "2",
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
    {
      title: "Belum Direview",
      value: "2",
      image: "/assets/admin/penjadwalanulang.svg",
      color: "text-orange-600",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Kelola Practice
          </h1>
          <p className="text-gray-600">Kelola Practice</p>
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
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
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
                {stat.image && (
                  <Image
                    src={stat.image}
                    alt={stat.title}
                    width={22}
                    height={22}
                    className="opacity-90"
                  />
                )}

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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Jadwal Sesi Pratice
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={projects} />
      </Card>
    </>
  );
}
