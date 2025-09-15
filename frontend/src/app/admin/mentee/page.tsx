"use client";

import { useState } from "react";
import { Download, Plus, Users, UserCheck, User, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { DataTable } from "./data-table";
import { columns, Mentee } from "./columns";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminMenteePage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    role: "Mentee",
    status: "Aktif",
  });
  const [mentees] = useState<Mentee[]>([
    { id: "ABCD01", photo: "/placeholder.svg?height=40&width=40&text=GD", name: "Gilang Dirga", username: "gildir", email: "gilangdirga11@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD02", photo: "/placeholder.svg?height=40&width=40&text=RS", name: "Rina Suryani", username: "rinsury", email: "sarah.connor@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD03", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "inaktif" },
    { id: "ABCD04", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "inaktif" },
    { id: "ABCD05", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD06", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD07", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD08", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD09", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD10", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD11", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD12", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
    { id: "ABCD13", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentee", status: "aktif" },
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
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center space-x-2"
            onClick={() => {
              setAddFormData({
                name: "",
                email: "",
                role: "Mentee",
                status: "Aktif",
              });
              setShowAddDialog(true);
            }}
          >
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

      {/* Add Mentee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Tambah Mentee Baru</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Photo Section */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-4">Foto Mentee</p>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="border-[#0CA678] text-[#0CA678] border-dashed hover:bg-[#0CA678] hover:text-white bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload foto profil
                  </Button>
                  <Button variant="destructive">Hapus</Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">File png atau jpg maks 4MB</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Nama Lengkap</label>
                <Input placeholder="Masukkan nama lengkap mentee" value={addFormData.name} onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })} className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                <Input type="email" placeholder="Masukkan alamat email aktif" value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Peran</label>
                  <Select value={addFormData.role} onValueChange={(value) => setAddFormData({ ...addFormData, role: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentee">Mentee</SelectItem>
                      <SelectItem value="Mentor">Mentor</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status Akun</label>
                  <Select value={addFormData.status} onValueChange={(value) => setAddFormData({ ...addFormData, status: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-4 sm:justify-center">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddDialog(false)}>
              Kembali
            </Button>
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              onClick={() => {
                console.log("Add new mentee:", addFormData);
                setShowAddDialog(false);
              }}
            >
              Tambah Mentee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
