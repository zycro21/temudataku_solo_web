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
  ]);

  const stats = [
    { title: "Total Sesi Practice", value: "80", icon: FileText, color: "text-gray-900" },
    { title: "Sudah Dikumpulkan", value: "78", icon: CheckCircle, color: "text-green-600" },
    { title: "Sudah Direview", value: "2", icon: CheckCircle, color: "text-green-600" },
    { title: "Belum Direview", value: "2", icon: Clock, color: "text-orange-600" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Practice</h1>
          <p className="text-gray-600">Kelola Practice</p>
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
        <h2 className="text-lg font-semibold text-gray-900">Jadwal Sesi Mentoring</h2>
        <DataTable columns={columns} data={projects} />
      </Card>
    </>
  );
}
