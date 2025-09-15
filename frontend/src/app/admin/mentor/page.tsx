"use client";

import { useState } from "react";
import { Download, Plus, Users, UserCheck, User, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { DataTable } from "./data-table";
import { columns, Mentor } from "./columns";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminMentorPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    role: "Mentor",
    status: "Aktif",
    expertise: "",
    bio: "",
  });
  const [addStep, setAddStep] = useState(1);
  const [mentees] = useState<Mentor[]>([
    { id: "ABCD01", photo: "/placeholder.svg?height=40&width=40&text=GD", name: "Gilang Dirga", username: "gildir", email: "gilangdirga11@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD02", photo: "/placeholder.svg?height=40&width=40&text=RS", name: "Rina Suryani", username: "rinsury", email: "sarah.connor@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD03", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "inaktif", bio: "gabut aja bang" },
    { id: "ABCD04", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "inaktif", bio: "gabut aja bang" },
    { id: "ABCD05", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD06", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD07", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD08", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD09", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD10", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD11", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD12", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
    { id: "ABCD13", photo: "/placeholder.svg?height=40&width=40&text=BS", name: "Budi Santoso", username: "budsans", email: "john.doe@gmail.com", role: "Mentor", status: "aktif", bio: "gabut aja bang" },
  ]);

  const stats = [
    { title: "Jumlah Mentor", value: "390", change: "+3 minggu ini", icon: Users },
    { title: "Mentor Aktif", value: "376", icon: UserCheck, color: "text-green-600" },
    { title: "Mentor Tidak Aktif", value: "14", icon: Users, color: "text-red-600" },
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
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center space-x-2"
            onClick={() => {
              setAddFormData({
                name: "",
                email: "",
                role: "Mentor",
                status: "Aktif",
                expertise: "",
                bio: "",
              });
              setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mentor</span>
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
        <h2 className="text-lg font-semibold text-gray-900">Mentor Terdaftar</h2>
        <DataTable columns={columns} data={mentees} />
      </Card>

      {/* Add Mentor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Tambah Mentor Baru</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${addStep === 1 ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>1</div>
              <span className={`text-sm font-medium ${addStep === 1 ? "text-[#0CA678]" : "text-gray-500"}`}>Lengkapi Informasi Dasar</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${addStep === 2 ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>2</div>
              <span className={`text-sm font-medium ${addStep === 2 ? "text-[#0CA678]" : "text-gray-500"}`}>Lengkapi Profil Admin</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${addStep === 3 ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>3</div>
              <span className={`text-sm font-medium ${addStep === 3 ? "text-[#0CA678]" : "text-gray-500"}`}>Atur Peran dan Status</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {addStep === 1 && (
              <>
                {/* Photo Section */}
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-4">Foto Mentor</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="outline" className="border-[#0CA678] text-[#0CA678] border-dashed hover:bg-[#0CA678] hover:text-white bg-transparent">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload foto profil
                      </Button>
                      <Button variant="destructive">Hapus</Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">File png atau jpg maks 4MB</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">Nama Lengkap</label>
                    <Input placeholder="Masukkan nama lengkap mentor" value={addFormData.name} onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })} className="w-full py-3 text-base" />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">Email</label>
                    <Input type="email" placeholder="Masukkan alamat email aktif" value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} className="w-full py-3 text-base" />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Admin Profile */}
            {addStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Keahlian Mentor</label>
                  <Select value={addFormData.expertise || ""} onValueChange={(value) => setAddFormData({ ...addFormData, expertise: value })}>
                    <SelectTrigger className="w-full py-3 text-base">
                      <SelectValue placeholder="Data Engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Data Engineer">Data Engineer</SelectItem>
                      <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                      <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                      <SelectItem value="Machine Learning Engineer">Machine Learning Engineer</SelectItem>
                      <SelectItem value="Business Intelligence">Business Intelligence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Bio</label>
                  <textarea
                    placeholder="Masukkan bio mentor"
                    value={addFormData.bio || ""}
                    onChange={(e) => setAddFormData({ ...addFormData, bio: e.target.value })}
                    className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md resize-none focus:ring-[#0CA678] focus:border-[#0CA678] text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Role and Status */}
            {addStep === 3 && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Peran</label>
                  <Select value={addFormData.role} onValueChange={(value) => setAddFormData({ ...addFormData, role: value })}>
                    <SelectTrigger className="w-full py-3 text-base">
                      <SelectValue placeholder="Mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentee">Mentee</SelectItem>
                      <SelectItem value="Mentor">Mentor</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Status Akun</label>
                  <Select value={addFormData.status} onValueChange={(value) => setAddFormData({ ...addFormData, status: value })}>
                    <SelectTrigger className="w-full py-3 text-base">
                      <SelectValue placeholder="Aktif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-4 sm:justify-center mt-8">
            <Button
              variant="outline"
              className="flex-1 bg-transparent py-3"
              onClick={() => {
                if (addStep === 1) {
                  setShowAddDialog(false);
                  setAddStep(1);
                } else {
                  setAddStep(addStep - 1);
                }
              }}
            >
              {addStep === 1 ? "Kembali" : "Sebelumnya"}
            </Button>
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C] py-3"
              onClick={() => {
                if (addStep === 3) {
                  console.log("Add new mentor:", addFormData);
                  setShowAddDialog(false);
                  setAddStep(1);
                  setAddFormData({
                    name: "",
                    email: "",
                    role: "Mentor",
                    status: "Aktif",
                    expertise: "",
                    bio: "",
                  });
                } else {
                  setAddStep(addStep + 1);
                }
              }}
            >
              {addStep === 3 ? "Tambah Mentor" : "Selanjutnya"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
