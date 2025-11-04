"use client";

import { useState } from "react";
import { FileText, Download, Clock, CheckCircle, Eye, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DataTable as DataTableSertifikatTerbit } from "./history/sertifikat-terbit/data-table";
import { DataTable as DataTableSertifikatMentee } from "./history/sertifkat-mentee/data-table";
import { columns as columnsSertifikatTerbit, PublishedCertificate } from "./history/sertifikat-terbit/columns";
import { columnsMentee, MenteeCertificate } from "./history/sertifkat-mentee/columns";
export default function AdminMentorPage() {
  const publishedCertificates: PublishedCertificate[] = [
    {
      id: "MNTG01",
      template: "/placeholder.svg?height=40&width=60&text=Template",
      name: "Sertifikat Kelulusan",
      program: "Short Class",
      date: "10-05-2025, 20:00",
    },
    {
      id: "MNTG02",
      template: "/placeholder.svg?height=40&width=60&text=Template",
      name: "Sertifikat Penyelesaian",
      program: "Live Class",
      date: "10-05-2025, 20:00",
    },
  ];

  const menteeCertificates: MenteeCertificate[] = [
    {
      id: "MNTG01",
      mentee: "Jehan Ra",
      name: "Sertifikat Kelulusan",
      program: "Short Class",
      date: "10-05-2025, 20:00",
    },
    {
      id: "MNTG02",
      mentee: "Galih B",
      name: "Sertifikat Penyelesaian",
      program: "Live Class",
      date: "10-05-2025, 20:00",
    },
  ];

  const stats = [{ title: "Jumlah Sertifikat Terbit", value: "5", icon: FileText, color: "text-gray-900" }];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project</h1>
          <p className="text-gray-600">Project</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center space-x-2"
            onClick={() => {
              // setAddFormData({
              //   name: "",
              //   email: "",
              //   role: "Mentee",
              //   status: "Aktif",
              // });
              // setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sertifikat</span>
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

      {/* DataTable sertifikat terbit */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Jadwal Sesi Mentoring</h2>
        <DataTableSertifikatTerbit columns={columnsSertifikatTerbit} data={publishedCertificates} />
      </Card>
      <Card className="p-6 mt-5">
        <h2 className="text-lg font-semibold text-gray-900">Jadwal Sesi Mentoring</h2>
        <DataTableSertifikatMentee columns={columnsMentee} data={menteeCertificates} />
      </Card>
    </>
  );
}
