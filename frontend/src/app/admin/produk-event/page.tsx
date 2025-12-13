"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FileText,
  Download,
  CheckCircle,
  Plus,
  Upload,
  ChevronUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "./data-table";
import { columns, Project } from "./columns";
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

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "P001",
      foto: "/images/Navbar_logo.png",
      nama: "Excel Untuk Pemula",
      kategori: "Practice",
      harga: "Rp 150.000",
      deskripsi: "Kelas belajar excel dasar",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 20,
      hargaDiskon: "Rp 120.000",
      tanggalDitambahkan: "2025-01-05",
    },
    {
      id: "P002",
      foto: "/images/Navbar_logo.png",
      nama: "Introduction to Data Science",
      kategori: "E-Learning",
      harga: "Rp 850.000",
      deskripsi: "Pengenalan awal data science",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 150000,
      hargaDiskon: "Rp 700.000",
      tanggalDitambahkan: "2025-01-08",
    },

    // ================= Tambahan 27 data baru =================

    {
      id: "P003",
      foto: "/images/Navbar_logo.png",
      nama: "Frontend Developer Roadmap",
      kategori: "Mentoring",
      tipeMentoring: "Bootcamp",
      harga: "Rp 1.500.000",
      deskripsi: "Belajar frontend dari dasar hingga mahir",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 15,
      hargaDiskon: "Rp 1.275.000",
      tanggalDitambahkan: "2025-01-10",
    },
    {
      id: "P004",
      foto: "/images/Navbar_logo.png",
      nama: "Backend Developer With Node.js",
      kategori: "Practice",
      harga: "Rp 1.600.000",
      deskripsi: "Belajar backend menggunakan Node.js",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 200000,
      hargaDiskon: "Rp 1.400.000",
      tanggalDitambahkan: "2025-01-12",
    },
    {
      id: "P005",
      foto: "/images/Navbar_logo.png",
      nama: "UI/UX Design for Beginner",
      kategori: "E-Learning",
      harga: "Rp 250.000",
      deskripsi: "Pengenalan UI/UX dari dasar",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 10,
      hargaDiskon: "Rp 225.000",
      tanggalDitambahkan: "2025-01-14",
    },
    {
      id: "P006",
      foto: "/images/Navbar_logo.png",
      nama: "Python Dasar Untuk Pemula",
      kategori: "Practice",
      harga: "Rp 180.000",
      deskripsi: "Belajar python level pemula",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 30000,
      hargaDiskon: "Rp 150.000",
      tanggalDitambahkan: "2025-01-16",
    },
    {
      id: "P007",
      foto: "/images/Navbar_logo.png",
      nama: "Flutter Mobile Development",
      kategori: "Mentoring",
      tipeMentoring: "Live Class",
      harga: "Rp 1.400.000",
      deskripsi: "Belajar membuat aplikasi mobile dengan Flutter",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 25,
      hargaDiskon: "Rp 1.050.000",
      tanggalDitambahkan: "2025-01-18",
    },
    {
      id: "P008",
      foto: "/images/Navbar_logo.png",
      nama: "Machine Learning Dasar",
      kategori: "Practice",
      harga: "Rp 1.700.000",
      deskripsi: "Belajar konsep dasar machine learning",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 30,
      hargaDiskon: "Rp 1.190.000",
      tanggalDitambahkan: "2025-01-19",
    },
    {
      id: "P009",
      foto: "/images/Navbar_logo.png",
      nama: "Excel Advanced",
      kategori: "E-Learning",
      harga: "Rp 200.000",
      deskripsi: "Kelas excel lanjutan untuk pekerjaan",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 50000,
      hargaDiskon: "Rp 150.000",
      tanggalDitambahkan: "2025-01-21",
    },
    {
      id: "P010",
      foto: "/images/Navbar_logo.png",
      nama: "JavaScript Fundamental",
      kategori: "Practice",
      harga: "Rp 190.000",
      deskripsi: "Belajar fundamental JavaScript",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 15,
      hargaDiskon: "Rp 161.500",
      tanggalDitambahkan: "2025-01-22",
    },
    {
      id: "P011",
      foto: "/images/Navbar_logo.png",
      nama: "Social Media Marketing",
      kategori: "E-Learning",
      harga: "Rp 220.000",
      deskripsi: "Belajar mengelola sosial media secara profesional",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 30000,
      hargaDiskon: "Rp 190.000",
      tanggalDitambahkan: "2025-01-23",
    },
    {
      id: "P012",
      foto: "/images/Navbar_logo.png",
      nama: "SEO Mastery",
      kategori: "Practice",
      harga: "Rp 300.000",
      deskripsi: "Belajar optimasi SEO untuk website",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 20,
      hargaDiskon: "Rp 240.000",
      tanggalDitambahkan: "2025-01-24",
    },
    {
      id: "P013",
      foto: "/images/Navbar_logo.png",
      nama: "SQL & Database",
      kategori: "E-Learning",
      harga: "Rp 210.000",
      deskripsi: "Belajar dasar database dan SQL",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 20000,
      hargaDiskon: "Rp 190.000",
      tanggalDitambahkan: "2025-01-25",
    },
    {
      id: "P014",
      foto: "/images/Navbar_logo.png",
      nama: "Google Ads for Beginner",
      kategori: "Practice",
      harga: "Rp 260.000",
      deskripsi: "Belajar menjalankan campaign Google Ads",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 10,
      hargaDiskon: "Rp 234.000",
      tanggalDitambahkan: "2025-01-26",
    },
    {
      id: "P015",
      foto: "/images/Navbar_logo.png",
      nama: "TikTok Ads Optimization",
      kategori: "Practice",
      harga: "Rp 240.000",
      deskripsi: "Belajar optimasi iklan di TikTok",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 40000,
      hargaDiskon: "Rp 200.000",
      tanggalDitambahkan: "2025-01-27",
    },
    {
      id: "P016",
      foto: "/images/Navbar_logo.png",
      nama: "React JS Masterclass",
      kategori: "Mentoring",
      tipeMentoring: "1 on 1 Mentoring",
      harga: "Rp 1.500.000",
      deskripsi: "Belajar React dari dasar sampai mahir",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 20,
      hargaDiskon: "Rp 1.200.000",
      tanggalDitambahkan: "2025-01-28",
    },
    {
      id: "P017",
      foto: "/images/Navbar_logo.png",
      nama: "Docker for Developer",
      kategori: "Practice",
      harga: "Rp 230.000",
      deskripsi: "Belajar Docker untuk developer",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 20000,
      hargaDiskon: "Rp 210.000",
      tanggalDitambahkan: "2025-01-29",
    },
    {
      id: "P018",
      foto: "/images/Navbar_logo.png",
      nama: "Kotlin Android Development",
      kategori: "E-Learning",
      harga: "Rp 1.550.000",
      deskripsi: "Belajar membuat aplikasi Android dengan Kotlin",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 25,
      hargaDiskon: "Rp 1.162.500",
      tanggalDitambahkan: "2025-01-30",
    },
    {
      id: "P019",
      foto: "/images/Navbar_logo.png",
      nama: "Figma for UI Designer",
      kategori: "Practice",
      harga: "Rp 200.000",
      deskripsi: "Belajar mendesain UI menggunakan Figma",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 30000,
      hargaDiskon: "Rp 170.000",
      tanggalDitambahkan: "2025-02-01",
    },
    {
      id: "P020",
      foto: "/images/Navbar_logo.png",
      nama: "PHP Programming",
      kategori: "E-Learning",
      harga: "Rp 190.000",
      deskripsi: "Belajar dasar pemrograman PHP",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 10,
      hargaDiskon: "Rp 171.000",
      tanggalDitambahkan: "2025-02-02",
    },
    {
      id: "P021",
      foto: "/images/Navbar_logo.png",
      nama: "Fullstack Web Developer",
      kategori: "Mentoring",
      tipeMentoring: "Group Mentoring",
      harga: "Rp 1.900.000",
      deskripsi: "Belajar fullstack web development",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 15,
      hargaDiskon: "Rp 1.615.000",
      tanggalDitambahkan: "2025-02-03",
    },
    {
      id: "P022",
      foto: "/images/Navbar_logo.png",
      nama: "Cyber Security Basic",
      kategori: "Practice",
      harga: "Rp 250.000",
      deskripsi: "Pengenalan cyber security untuk pemula",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 40000,
      hargaDiskon: "Rp 210.000",
      tanggalDitambahkan: "2025-02-04",
    },
    {
      id: "P023",
      foto: "/images/Navbar_logo.png",
      nama: "English for Professional",
      kategori: "E-Learning",
      harga: "Rp 180.000",
      deskripsi: "Belajar English Profesional",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 20,
      hargaDiskon: "Rp 144.000",
      tanggalDitambahkan: "2025-02-05",
    },
    {
      id: "P024",
      foto: "/images/Navbar_logo.png",
      nama: "Project Management Basic",
      kategori: "Practice",
      harga: "Rp 260.000",
      deskripsi: "Belajar dasar project management",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 30000,
      hargaDiskon: "Rp 230.000",
      tanggalDitambahkan: "2025-02-06",
    },
    {
      id: "P025",
      foto: "/images/Navbar_logo.png",
      nama: "Java Programming Bootcamp",
      kategori: "Mentoring",
      tipeMentoring: "Bootcamp",
      harga: "Rp 1.700.000",
      deskripsi: "Belajar Java lengkap",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 10,
      hargaDiskon: "Rp 1.530.000",
      tanggalDitambahkan: "2025-02-07",
    },
    {
      id: "P026",
      foto: "/images/Navbar_logo.png",
      nama: "Artificial Intelligence Introduction",
      kategori: "Practice",
      harga: "Rp 1.800.000",
      deskripsi: "Belajar konsep AI modern",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 250000,
      hargaDiskon: "Rp 1.550.000",
      tanggalDitambahkan: "2025-02-08",
    },
    {
      id: "P027",
      foto: "/images/Navbar_logo.png",
      nama: "Vue.js Complete Guide",
      kategori: "E-Learning",
      harga: "Rp 240.000",
      deskripsi: "Belajar Vue.js dari dasar",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 15,
      hargaDiskon: "Rp 204.000",
      tanggalDitambahkan: "2025-02-09",
    },
    {
      id: "P028",
      foto: "/images/Navbar_logo.png",
      nama: "Golang Backend Developer",
      kategori: "Mentoring",
      tipeMentoring: "Live Class",
      harga: "Rp 1.750.000",
      deskripsi: "Belajar backend dengan Golang",
      status: "Aktif",
      diskonTipe: "angka",
      diskon: 300000,
      hargaDiskon: "Rp 1.450.000",
      tanggalDitambahkan: "2025-02-10",
    },
    {
      id: "P029",
      foto: "/images/Navbar_logo.png",
      nama: "Business Strategy Fundamentals",
      kategori: "Practice",
      harga: "Rp 220.000",
      deskripsi: "Belajar dasar strategi bisnis",
      status: "Aktif",
      diskonTipe: "persentase",
      diskon: 25,
      hargaDiskon: "Rp 165.000",
      tanggalDitambahkan: "2025-02-11",
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addStep, setAddStep] = useState(1);

  type Kategori = "Mentoring" | "Practice" | "E-Learning";
  type TipeMentoring =
    | "Bootcamp"
    | "Short Class"
    | "Live Class"
    | "1 on 1 Mentoring"
    | "Group Mentoring"
    | undefined;

  const [addFormData, setAddFormData] = useState({
    nama: "",
    kategori: "Mentoring" as Kategori,
    tipeMentoring: undefined as TipeMentoring,
    foto: null as File | null,
    deskripsi: "",
    harga: "",
    status: "Aktif",
    diskonTipe: "persentase",
    diskon: 0,
    hargaDiskon: "",
  });

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    setAddStep(1);
  };

  const handleNextStep = () => setAddStep(2);
  const handlePrevStep = () => setAddStep(1);

  const handleSave = () => {
    const newItem: Project = {
      id: "P" + String(projects.length + 1).padStart(3, "0"),
      foto: "/images/default.png",
      nama: addFormData.nama,
      kategori: addFormData.kategori,
      tipeMentoring:
        addFormData.kategori === "Mentoring"
          ? addFormData.tipeMentoring
          : undefined,
      harga: "Rp " + addFormData.harga,
      deskripsi: addFormData.deskripsi,
      status: addFormData.status,
      diskonTipe: addFormData.diskonTipe,
      diskon: addFormData.diskon ?? 0, // ← tambahkan ini, default 0 kalau kosong
      hargaDiskon: "Rp " + addFormData.hargaDiskon,
    };

    setProjects([...projects, newItem]);
    handleCloseAddDialog();
  };

  const stats = [
    {
      title: "Total Produk & Event",
      value: "10",
      image: "/assets/admin/pro.svg",
      color: "text-gray-900",
    },
    {
      title: "Mentoring",
      value: "2",
      image: "/assets/admin/produkmentoring.svg",
      color: "text-green-600",
    },
    {
      title: "Practice",
      value: "10",
      image: "/assets/admin/produkpractice.svg",
      color: "text-green-600",
    },
    {
      title: "E-Learning",
      value: "10",
      image: "/assets/admin/tugas.svg",
      color: "text-green-600",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Produk & Event
          </h1>
          <p className="text-gray-600">Produk & Event</p>
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

                {/* Chevron toggle */}
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

          {/* Tombol Tambah Produk & Event */}
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center gap-1"
            onClick={() => {
              setAddFormData({
                nama: "",
                kategori: "Mentoring",
                tipeMentoring: "Bootcamp",
                foto: null,
                deskripsi: "",
                harga: "",
                status: "Aktif",
                diskonTipe: "persentase",
                diskon: 0,
                hargaDiskon: "",
              });

              setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk & Event</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={20}
                  height={20}
                  className="opacity-90"
                />
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
        Daftar Produk & Event
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={projects} />
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Tambah Produk / Event Baru</DialogTitle>
            </div>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="my-6">
            <div className="flex items-center space-x-6">
              {/* Step 1 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    addStep >= 1
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-sm font-bold ${
                    addStep === 1 ? "text-[#0CA678]" : "text-gray-400"
                  }`}
                >
                  Informasi Dasar
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    addStep >= 2
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-bold ${
                    addStep === 2 ? "text-[#0CA678]" : "text-gray-400"
                  }`}
                >
                  Deskripsi & Harga
                </span>
              </div>
            </div>

            {/* Garis pemisah bawah */}
            <div className="border-b pb-4 mt-4" />
          </div>

          {/* Form Content (scrollable) */}
          <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
            {addStep === 1 ? (
              <>
                {/* Foto */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Foto Produk Atau Event
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {addFormData.foto ? (
                      <img
                        src={URL.createObjectURL(addFormData.foto)}
                        alt="Preview"
                        className="mx-auto mb-3 w-24 h-24 object-cover rounded"
                      />
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-[#0CA678] mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Pilih file atau seret di sini
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          png atau jpg
                        </p>
                      </>
                    )}

                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          foto: e.target.files ? e.target.files[0] : null,
                        })
                      }
                    />

                    <Button
                      className="bg-[#0CA678] hover:bg-[#08916C] text-white"
                      onClick={() =>
                        document.getElementById("fileUpload")?.click()
                      }
                    >
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Nama */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Nama Produk
                  </label>
                  <Input
                    placeholder="Contoh: Bootcamp UI/UX"
                    value={addFormData.nama}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, nama: e.target.value })
                    }
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Kategori
                  </label>
                  <Select
                    value={addFormData.kategori}
                    onValueChange={(value) =>
                      setAddFormData({
                        ...addFormData,
                        kategori: value as Kategori,
                      })
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentoring">Mentoring</SelectItem>
                      <SelectItem value="Practice">Practice</SelectItem>
                      <SelectItem value="E-Learning">E-Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipe Mentoring */}
                {addFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      Tipe Mentoring
                    </label>

                    <Select
                      value={addFormData.tipeMentoring}
                      onValueChange={(value) =>
                        setAddFormData({
                          ...addFormData,
                          tipeMentoring: value as TipeMentoring,
                        })
                      }
                    >
                      <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <SelectValue placeholder="Pilih tipe mentoring" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="Short Class">Short Class</SelectItem>
                        <SelectItem value="Live Class">Live Class</SelectItem>
                        <SelectItem value="1 on 1 Mentoring">
                          1 on 1 Mentoring
                        </SelectItem>
                        <SelectItem value="Group Mentoring">
                          Group Mentoring
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Deskripsi */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    placeholder="Masukkan deskripsi produk"
                    value={addFormData.deskripsi}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        deskripsi: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {/* Harga */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Harga
                  </label>
                  <Input
                    placeholder="Contoh: 250000"
                    value={addFormData.harga}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, harga: e.target.value })
                    }
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Status
                  </label>
                  <Select
                    value={addFormData.status}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, status: value })
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Diskon */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Diskon
                  </label>

                  {/* Pilihan diskon horizontal */}
                  <div className="flex flex-row items-center gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="diskonTipe"
                        checked={addFormData.diskonTipe === "persentase"}
                        onChange={() =>
                          setAddFormData({
                            ...addFormData,
                            diskonTipe: "persentase",
                            diskon: 0,
                          })
                        }
                      />
                      <span className="text-sm font-bold text-gray-700">
                        Persentase (%)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="diskonTipe"
                        checked={addFormData.diskonTipe === "angka"}
                        onChange={() =>
                          setAddFormData({
                            ...addFormData,
                            diskonTipe: "angka",
                            diskon: 0,
                          })
                        }
                      />
                      <span className="text-sm font-bold text-gray-700">
                        Nominal (Rp)
                      </span>
                    </label>
                  </div>

                  {/* Input muncul jika radio dipilih */}
                  {addFormData.diskonTipe && (
                    <Input
                      className="mt-2"
                      placeholder={
                        addFormData.diskonTipe === "persentase"
                          ? "Isikan persentase diskon"
                          : "Isikan jumlah diskon dalam rupiah"
                      }
                      value={addFormData.diskon === 0 ? "" : addFormData.diskon} // ← kalau 0, kosong
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const harga = Number(addFormData.harga);

                        if (addFormData.diskonTipe === "persentase") {
                          const diskon = (harga * value) / 100;
                          setAddFormData({
                            ...addFormData,
                            diskon: value,
                            hargaDiskon: String(harga - diskon),
                          });
                        } else {
                          setAddFormData({
                            ...addFormData,
                            diskon: value,
                            hargaDiskon: String(harga - value),
                          });
                        }
                      }}
                    />
                  )}
                </div>

                {/* Harga Setelah Diskon */}
                {addFormData.hargaDiskon && (
                  <div className="bg-green-50 p-2 rounded-lg text-sm font-medium text-green-700">
                    Harga Setelah Diskon: Rp{addFormData.hargaDiskon}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t">
            {addStep === 1 ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent"
                  onClick={handleCloseAddDialog}
                >
                  Kembali
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={handleNextStep}
                >
                  Selanjutnya
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent"
                  onClick={handlePrevStep}
                >
                  Sebelumnya
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={handleSave}
                >
                  Simpan
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
