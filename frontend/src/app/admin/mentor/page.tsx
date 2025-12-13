"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  Plus,
  Users,
  UserCheck,
  User,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./data-table";
import { columns, Mentor } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function AdminMentorPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    role: "Mentor",
    status: "Aktif",
    expertise: "",
    bio: "",
  });
  const [addStep, setAddStep] = useState(1);

  const stats = [
    {
      title: "Jumlah Mentor",
      value: "390",
      change: "+3 minggu ini",
      image: "/assets/admin/mentee.svg",
    },
    {
      title: "Mentor Aktif",
      value: "376",
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
    {
      title: "Mentor Tidak Aktif",
      value: "14",
      image: "/assets/admin/menteenonac.svg",
      color: "text-red-600",
    },
  ];

  const [mentees] = useState<Mentor[]>([
    {
      id: "ABCD01",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Gilang Dirga",
      username: "gildir",
      email: "gilangdirga11@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Engineer",
    },
    {
      id: "ABCD02",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Rina Suryani",
      username: "rinsury",
      email: "sarah.connor@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Engineer",
    },
    {
      id: "ABCD03",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "inaktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD04",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "inaktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD05",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD06",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD07",
      photo: "/placeholder.svg?height=40&width=40&text=BS",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD08",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD09",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD10",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD11",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD12",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
    {
      id: "ABCD13",
      photo: "/assets/dashboard/user/avatar.png",
      name: "Budi Santoso",
      username: "budsans",
      email: "john.doe@gmail.com",
      role: "Mentor",
      status: "aktif",
      bio: "gabut aja bang",
      expertise: "Data Scientist",
    },
  ]);

  const expertiseOptions = [
    "Data Engineer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "Business Intelligence",
    "Software Engineer",
    "Mobile Developer",
    "Cloud Architect",
    "AI Researcher",
    "Fullstack Developer",
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">Mentor</h1>
          <p className="text-gray-600">Mentor</p>
        </div>

        <div className="flex items-center space-x-3">
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

          {/* Tombol Tambah Mentor */}
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center gap-1"
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

      {/* Stats Cards — mengikuti struktur Mentee */}
      <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
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
                {/* Icon pakai Next Image */}
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={15}
                  height={15}
                  className="opacity-90"
                />

                <p className="text-md font-medium text-gray-600">
                  {stat.title}
                </p>
              </div>

              {/* Chevron dummy */}
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

                {stat.change && (
                  <span className="inline-block text-xs font-medium text-emerald-700 bg-green-200 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Mentor Terdaftar
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={mentees} />
      </Card>

      {/* Add Mentor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="sm:max-w-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Tambah Mentor Baru
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-start space-x-8 mb-1">
            {" "}
            {/* STEP 1 */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  addStep === 1
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span
                className={`text-xs font-medium ${
                  addStep === 1 ? "text-[#0CA678]" : "text-gray-500"
                }`}
              >
                Lengkapi Informasi Dasar
              </span>
            </div>
            {/* STEP 2 */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  addStep === 2
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs font-medium ${
                  addStep === 2 ? "text-[#0CA678]" : "text-gray-500"
                }`}
              >
                Lengkapi Profil Admin
              </span>
            </div>
            {/* STEP 3 */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  addStep === 3
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-medium ${
                  addStep === 3 ? "text-[#0CA678]" : "text-gray-500"
                }`}
              >
                Atur Peran dan Status
              </span>
            </div>
          </div>

          {/* ───────── Separator between NAVIGATION & FORM ───────── */}
          <div className="border-b border-gray-200 mb-4"></div>

          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {addStep === 1 && (
              <>
                {/* Photo Section — UPDATED sesuai Add Mentee */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-4">
                    Foto Mentor
                  </p>

                  <div className="flex items-start space-x-4">
                    {/* Preview Foto */}
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>

                    {/* Bagian kanan */}
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-3">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          className="hidden"
                          id="upload-photo"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setPhotoPreview(URL.createObjectURL(file));
                          }}
                        />

                        <Button
                          variant="outline"
                          className="border-[#0CA678] text-[#0CA678] border-dashed hover:bg-[#0CA678] hover:text-white bg-transparent"
                          onClick={() =>
                            document.getElementById("upload-photo")?.click()
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload foto profil
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => setPhotoPreview("")}
                        >
                          Hapus
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        File png atau jpg maks 4MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Nama Lengkap
                    </label>
                    <Input
                      placeholder="Masukkan nama lengkap mentor"
                      value={addFormData.name}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, name: e.target.value })
                      }
                      className="w-full py-3 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="Masukkan alamat email aktif"
                      value={addFormData.email}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full py-3 text-base"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Admin Profile */}
            {addStep === 2 && (
              <div className="space-y-6">
                {/* Form Field 1 */}
                <div className="bg-gray-100 p-4 rounded-md">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Keahlian Mentor
                  </label>

                  <Select
                    value={addFormData.expertise || ""}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, expertise: value })
                    }
                  >
                    <SelectTrigger className="w-full py-3 text-base bg-white">
                      <SelectValue placeholder="Pilih keahlian" />
                    </SelectTrigger>

                    <SelectContent>
                      {expertiseOptions.map((item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Form Field 2 */}
                <div className="bg-gray-100 p-4 rounded-md">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Bio
                  </label>

                  <textarea
                    placeholder="Masukkan bio mentor"
                    value={addFormData.bio || ""}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, bio: e.target.value })
                    }
                    className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md 
          resize-none focus:ring-[#0CA678] focus:border-[#0CA678] 
          text-base bg-white"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Role and Status */}
            {addStep === 3 && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Peran
                  </label>
                  <Select
                    value={addFormData.role}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, role: value })
                    }
                  >
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
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Status Akun
                  </label>
                  <Select
                    value={addFormData.status}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, status: value })
                    }
                  >
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

          {/* ───────── Separator between FORM & CTA BUTTONS ───────── */}
          <div className="border-t border-gray-200 mt-2 pt-2"></div>

          <DialogFooter className="flex space-x-4 sm:justify-center mt-2">
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
