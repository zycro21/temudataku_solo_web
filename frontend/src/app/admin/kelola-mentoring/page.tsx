"use client";

import { useState } from "react";
import { Download, Users, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { DataTable } from "./jadwal-sesi/data-table";
import { columns, SesiMentoring } from "./jadwal-sesi/columns";

export default function AdminMentorPage() {
  const [mentees] = useState<SesiMentoring[]>([
    {
      id: "MNTG01",
      mentor: "Gilang Dirga",
      program: "Short Class",
      topik: "Excel Untuk Pemula",
      dokumenPendukung: "-",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG02",
      mentor: "Gilang Dirga",
      program: "Live Class",
      topik: "Introduction to Data Science",
      dokumenPendukung: "-",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG03",
      mentor: "Nina Pratiwi",
      program: "Bootcamp",
      topik: "Belajar Data Science dari Nol",
      dokumenPendukung: "-",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG04",
      mentor: "Nina Pratiwi",
      program: "1 on 1 Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG05",
      mentor: "Laura Ayu",
      program: "Group Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG06",
      mentor: "Gilang Dirga",
      program: "Group Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG07",
      mentor: "Laura Ayu",
      program: "Group Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG08",
      mentor: "Laura Ayu",
      program: "Group Mentoring",
      topik: "Visualisasi Data dengan Matplotlib",
      dokumenPendukung: "Lorem Ipsum.pdf",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG09",
      mentor: "Laura Ayu",
      program: "Short Class",
      topik: "Excel Untuk Pemula",
      dokumenPendukung: "-",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
    {
      id: "MNTG10",
      mentor: "Nina Pratiwi",
      program: "Short Class",
      topik: "Excel Untuk Pemula",
      dokumenPendukung: "-",
      status: "terjadwal",
      date: "20-10-26",
      durasi: "2 jam",
    },
  ]);

  const stats = [
    { title: "Mentoring Terdaftar", value: "390", change: "+3 minggu ini", icon: Users },
    { title: "Terjadwal", value: "376", icon: UserCheck, color: "text-blue-600" },
    { title: "Penjadwalan Ulang", value: "14", icon: Users, color: "text-orange-600" },
    { title: "Dibatalkan", value: "14", icon: Users, color: "text-red-600" },
    { title: "Selesai", value: "14", icon: Users, color: "text-green-600" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor</h1>
          <p className="text-gray-600">Mentor</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-3xl font-bold ${stat.color || "text-gray-900"}`}>{stat.value}</p>
                    {stat.change && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                </div>
                <stat.icon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DataTable */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Jadwal Sesi Mentoring</h2>
        <DataTable columns={columns} data={mentees} />
      </Card>
    </>
  );
}
