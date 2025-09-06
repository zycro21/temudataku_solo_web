"use client";

import { useState } from "react";
import { Download, Plus, Users, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { DataTable } from "./data-table";
import { columns, Mentee } from "./columns";

export default function AdminMenteePage() {
  const [mentees] = useState<Mentee[]>([
    { id: "ABCD01", photo: "/placeholder.svg?height=40&width=40&text=GD", name: "Gilang Dirga", username: "gildir", email: "gilangdirga11@gmail.com", role: "Mentee" },
    { id: "ABCD02", photo: "/placeholder.svg?height=40&width=40&text=RS", name: "Rina Suryani", username: "rinsury", email: "sarah.connor@gmail.com", role: "Mentee" },
    { id: "ABCD03", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD04", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD05", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD06", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD07", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD08", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD09", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD10", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD11", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD12", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
    { id: "ABCD13", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee" },
  ]);

  const stats = [
    { title: "Jumlah Mentee", value: "390", change: "+3 minggu ini", icon: Users },
    { title: "Mentee Aktif", value: "376", icon: UserCheck, color: "text-green-600" },
    { title: "Mentee Tidak Aktif", value: "14", icon: Users, color: "text-red-600" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentee</h1>
          <p className="text-gray-600">Mentee</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
          <Button className="bg-[#0CA678] hover:bg-[#08916C] flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Mentee</span>
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
        <h2 className="text-lg font-semibold text-gray-900">Mentee Terdaftar</h2>
        <DataTable columns={columns} data={mentees} />
      </Card>
    </>
  );
}
