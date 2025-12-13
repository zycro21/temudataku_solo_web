"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  Eye,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      mentor: "Gilang Dirga",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      projectFile: "",
      topic: "Excel Untuk Pemula",
      statusDetail: "Belum Dinilai",
      score: "",
      document: "",
    },
    {
      id: "MNTG02",
      mentee: "Galih B",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      projectFile: "",
      topic: "Introduction to Data Science",
      statusDetail: "Belum Dinilai",
      score: "",
      document: "",
    },
    {
      id: "MNTG03",
      mentee: "Bonda Prakoso",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      projectFile: "",
      topic: "Belajar Data Science dari Nol",
      statusDetail: "Belum Dinilai",
      score: "",
      document: "",
    },
    {
      id: "MNTG04",
      mentee: "Kepa",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      projectFile: "Lorem Ipsum.pdf",
      topic: "Visualisasi Data dengan Matplotlib",
      statusDetail: "Belum Dinilai",
      score: "",
      document: "Lorem Ipsum.pdf",
    },
    {
      id: "MNTG05",
      mentee: "Darwin Nunez",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      projectFile: "Lorem Ipsum.pdf",
      topic: "Visualisasi Data dengan Matplotlib",
      statusDetail: "Sudah Dinilai",
      score: "85",
      document: "Lorem Ipsum.pdf",
    },
    {
      id: "MNTG06",
      mentee: "Marc Marquez",
      mentor: "Gilang Dirga",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      projectFile: "Lorem Ipsum.pdf",
      topic: "Visualisasi Data dengan Matplotlib",
      statusDetail: "Sudah Dinilai",
      score: "92",
      document: "Lorem Ipsum.pdf",
    },
    {
      id: "MNTG07",
      mentee: "Rafael Struick",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      projectFile: "Lorem Ipsum.pdf",
      topic: "Visualisasi Data dengan Matplotlib",
      statusDetail: "Sudah Dinilai",
      score: "88",
      document: "Lorem Ipsum.pdf",
    },
    {
      id: "MNTG08",
      mentee: "Marteen Paes",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "10-05-2025, 20:00",
      projectFile: "Lorem Ipsum.pdf",
      topic: "Visualisasi Data dengan Matplotlib",
      statusDetail: "Sudah Dinilai",
      score: "90",
      document: "Lorem Ipsum.pdf",
    },
    {
      id: "MNTG09",
      mentee: "Kevin Mendoza",
      mentor: "Laura Ayu",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      projectFile: "Lorem Ipsum Dolor.pdf",
      topic: "Visualisasi Data dengan Matplotlib",
      statusDetail: "Sudah Dinilai",
      score: "99",
      document: "Lorem Ipsum Dolor.pdf",
    },
    {
      id: "MNTG10",
      mentee: "Lorenzo",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      date: "10-05-2025, 20:00",
      projectFile: "",
      topic: "Excel Untuk Pemula",
      statusDetail: "Belum Dinilai",
      score: "",
      document: "",
    },
    // Tambahan 5 data baru
    {
      id: "MNTG11",
      mentee: "Satria Adi",
      mentor: "Gilang Dirga",
      program: "Short Class",
      date: "11-05-2025, 18:00",
      projectFile: "Satria_Excel.pdf",
      topic: "Excel Lanjutan",
      statusDetail: "Belum Dinilai",
      score: "",
      document: "Satria_Excel.pdf",
    },
    {
      id: "MNTG12",
      mentee: "Nadia Fitri",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "11-05-2025, 19:00",
      projectFile: "",
      topic: "Python Dasar",
      statusDetail: "Belum Dinilai",
      score: "",
      document: "",
    },
    {
      id: "MNTG13",
      mentee: "Ahmad Fauzi",
      mentor: "Nina Pratiwi",
      program: "Live Class",
      date: "12-05-2025, 20:30",
      projectFile: "Fauzi_Python.pdf",
      topic: "Python untuk Data Science",
      statusDetail: "Sudah Dinilai",
      score: "87",
      document: "Fauzi_Python.pdf",
    },
    {
      id: "MNTG14",
      mentee: "Lia Kartika",
      mentor: "Gilang Dirga",
      program: "Short Class",
      date: "12-05-2025, 21:00",
      projectFile: "",
      topic: "Analisis Data dengan Excel",
      statusDetail: "Belum Dinilai",
      score: "",
      document: "",
    },
    {
      id: "MNTG15",
      mentee: "Rizky Maulana",
      mentor: "Laura Ayu",
      program: "Bootcamp",
      date: "13-05-2025, 20:00",
      projectFile: "Rizky_Visualization.pdf",
      topic: "Visualisasi Data Lanjutan",
      statusDetail: "Sudah Dinilai",
      score: "91",
      document: "Rizky_Visualization.pdf",
    },
  ]);

  const stats = [
    {
      title: "Total Project",
      value: "80",
      image: "/assets/admin/totalproject.svg",
      color: "text-gray-900",
    },
    {
      title: "Sudah Mengirim",
      value: "78",
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
    {
      title: "Belum Mengirim",
      value: "2",
      image: "/assets/admin/penjadwalanulang.svg",
      color: "text-orange-600",
    },
    {
      title: "Sudah Direview",
      value: "78",
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">Project</h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Project</span>
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

      {/* Stats Cards — versi mirip page jadwal sesi */}
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
                {/* Jika ada image/icon, bisa pakai stat.image */}
                {stat.image && (
                  <Image
                    src={stat.image}
                    alt={stat.title}
                    width={15}
                    height={15}
                    className="opacity-90"
                  />
                )}
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

                {/* {stat.change && (
                  <span className="inline-block text-xs font-medium text-emerald-700 bg-green-200 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )} */}
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
        <DataTable columns={columns} data={projects} />
      </Card>
    </>
  );
}
